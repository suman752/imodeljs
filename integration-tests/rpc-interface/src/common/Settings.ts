/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { LogLevel } from "@bentley/bentleyjs-core";
import {
  IModelReadRpcInterface, IModelWriteRpcInterface,
  IModelTileRpcInterface, DevToolsRpcInterface,
} from "@bentley/imodeljs-common";
import { PresentationRpcInterface } from "@bentley/presentation-common";

// tslint:disable:ter-indent

export type User = [
  string,
  string
];

export interface Backend {
  version: string;
  location: string;
  name: string;
  path: string;
}

export interface IModelData {
  id: string;
  projectId: string;
  name?: string; // The name is not required to actually get the iModel, only the id.
  changeSetId?: string;
}

export function getRpcInterfaces(settings: Settings) {
  const rpcInterfaces = [];
  if (settings.runDevToolsRpcTests)
    rpcInterfaces.push(DevToolsRpcInterface);
  if (settings.runPresentationRpcTests)
    rpcInterfaces.push(PresentationRpcInterface);
  if (settings.runiModelReadRpcTests)
    rpcInterfaces.push(IModelReadRpcInterface);
  if (settings.runiModelWriteRpcTests)
    rpcInterfaces.push(IModelWriteRpcInterface);
  if (settings.runiModelTileRpcTests)
    rpcInterfaces.push(IModelTileRpcInterface);

  return rpcInterfaces;
}

export class Settings {
  private _backend: Backend = {} as Backend;
  public env: number = 0;
  public oidcClientId!: string;
  public oidcScopes!: string;
  public oidcRedirect!: string;
  public imsUrl!: string;
  public discovery!: string;
  public gprid?: string;
  public logLevel?: number;
  public users: User[] = [];

  public iModels: IModelData[] = [];
  public get iModel(): IModelData { return this.iModels[0]; }
  public get writeIModel(): IModelData { return this.iModels[1]; }
  public get user(): User { return this.users[0]; }

  public get Backend(): Backend { return this._backend; }

  public get runiModelTileRpcTests(): boolean { return undefined === process.env.RPC_IMODELTILE_ENABLE ? false : true; }
  public get runPresentationRpcTests(): boolean { return undefined === process.env.RPC_PRESENTATION_ENABLE ? false : true; }
  public get runiModelReadRpcTests(): boolean { return undefined === process.env.RPC_IMODELREAD_ENABLE ? false : true; }
  public get runiModelWriteRpcTests(): boolean { return undefined === process.env.RPC_IMODELWRITE_ENABLE ? false : true; }
  public get runDevToolsRpcTests(): boolean { return undefined === process.env.RPC_DEVTOOLS_ENABLE ? false : true; }

  constructor(env: NodeJS.ProcessEnv) {
    const isFrontend = (typeof (process) === "undefined");
    if (!isFrontend && undefined === env.TF_BUILD) {
      const path = require("path");
      const dotenv = require("dotenv");
      const dotenvExpand = require("dotenv-expand");
      // First check in process.cwd() for the config
      let result = dotenv.config();
      if (result.error) {
        const potential = path.resolve(process.cwd(), "..", "..", "..", "imodeljs-config", ".env");
        result = dotenv.config({ path: potential });
        if (result.error)
          throw result.error;
      }

      dotenvExpand(result);
    }

    if (isFrontend)
      globalThis.process = { browser: true, env } as any;

    // Loads the config out of the environment.
    this.load();
  }

  /** Loads the necessary variables from `process.env`.
   */
  private load() {

    // Parse environment
    if (undefined !== process.env.ENVIRONMENT)
      this.env = parseInt(process.env.ENVIRONMENT, 0);

    // Parse OIDC
    if (undefined === process.env.OIDC_CLIENT_ID)
      throw new Error("Missing the 'OIDC_CLIENT_ID' setting.");
    this.oidcClientId = process.env.OIDC_CLIENT_ID!;

    if (undefined === process.env.OIDC_SCOPES)
      throw new Error("Missing the 'OIDC_SCOPES' setting");
    this.oidcScopes = process.env.OIDC_SCOPES;

    this.oidcRedirect = (undefined === process.env.OIDC_REDIRECT) ? "http://localhost:5000" : process.env.OIDC_REDIRECT;

    // Parse GPRId
    if (undefined !== process.env.GPRID)
      this.gprid = process.env.GPRID;

    //  Parse the iModel variables
    if (undefined === process.env.IMODEL_PROJECTID)
      throw new Error("Missing the 'IMODEL_PROJECTID' setting.");

    if (undefined === process.env.IMODEL_IMODELID)
      throw new Error("Missing the 'IMODEL_IMODELID' setting.");

    this.iModels.push({
      projectId: process.env.IMODEL_PROJECTID,
      id: process.env.IMODEL_IMODELID,
      // Neither of the next 2 are needed but since they'll be undefined anyway, just always set it.
      name: process.env.IMODEL_IMODELNAME,
      changeSetId: process.env.IMODEL_CHANGESETID,
    });

    // If write rpc interface is defined expect a separate iModel to be used.
    if (this.runiModelWriteRpcTests) {
      if (undefined === process.env.IMODEL_WRITE_PROJECTID)
        throw new Error("Missing the 'IMODEL_WRITE_PROJECTID' setting.");

      if (undefined === process.env.IMODEL_WRITE_IMODELID)
        throw new Error("Missing the 'IMODEL_WRITE_IMODELID' setting.");

      this.iModels.push({
        projectId: process.env.IMODEL_WRITE_PROJECTID,
        id: process.env.IMODEL_WRITE_IMODELID,
      });
    }

    // Parse logging level
    if (undefined !== process.env.LOG_LEVEL) {
      const level = parseInt(process.env.LOG_LEVEL, 10);
      if (!isNaN(level) && undefined !== LogLevel[level])
        this.logLevel = level;
    }

    // Get backend data
    if (undefined === process.env.BACKEND_LOCATION)
      throw new Error("Missing the 'BACKEND_LOCATION' setting.");
    this._backend.location = process.env.BACKEND_LOCATION;

    if (undefined === process.env.BACKEND_VERSION)
      throw new Error("Missing the 'BACKEND_VERSION' setting.");
    this._backend.version = process.env.BACKEND_VERSION;

    if (undefined === process.env.BACKEND_NAME)
      throw new Error("Missing the 'BACKEND_NAME' setting.");
    this._backend.name = process.env.BACKEND_NAME;

    // Get users
    this.users.push([process.env.USER_WITH_ACCESS_USERNAME || "", process.env.USER_WITH_ACCESS_PASSWORD || ""]);
    // this.users.push([process.env.USER_WITHOUT_ACCESS_USERNAME || "", process.env.USER_WITHOUT_ACCESS_PASSWORD || ""]);
  }

  public toString(): string {
    return `Configurations:
      backend location: ${this.Backend.location},
      backend name: ${this.Backend.name},
      backend version: ${this.Backend.version},
      oidc client id: ${this.oidcClientId},
      oidc scopes: ${this.oidcScopes},
      applicationId: ${this.gprid},
      log level: ${this.logLevel},
      testing iModelTileRpcTests: ${this.runiModelTileRpcTests},
      testing PresentationRpcTest: ${this.runPresentationRpcTests},
      testing iModelReadRpcTests: ${this.runiModelReadRpcTests},
      testing DevToolsRpcTests: ${this.runDevToolsRpcTests},
      testing iModelWriteRpcTests: ${this.runiModelWriteRpcTests}`;
  }
}
