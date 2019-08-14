/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/

import { GeometryQuery } from "./GeometryQuery";
import { Matrix4d } from "../geometry4d/Matrix4d";
import { CurveLocationDetailArrayPair, CurveCurveIntersectXY } from "./CurveCurveIntersectXY";
import { CurveCurveIntersectXYZ } from "./CurveCurveIntersectXYZ";
/**
 * `CurveCurve` has static method for various computations that work on a pair of curves or curve collections.
 * @public
 */
export class CurveCurve {
  /**
   * Return xy intersections of 2 curves.
   * @param geometryA second geometry
   * @param extendA true to allow geometryA to extend
   * @param geometryB second geometry
   * @param extendB true to allow geometryB to extend
   */
  public static intersectionXY(geometryA: GeometryQuery, extendA: boolean, geometryB: GeometryQuery, extendB: boolean): CurveLocationDetailArrayPair {
    const handler = new CurveCurveIntersectXY(undefined, geometryA, extendA, geometryB, extendB);
    geometryA.dispatchToGeometryHandler(handler);
    return handler.grabResults();
  }
  /**
   * Return xy intersections of 2 projected curves
   * @param geometryA second geometry
   * @param extendA true to allow geometryA to extend
   * @param geometryB second geometry
   * @param extendB true to allow geometryB to extend
   */
  public static intersectionProjectedXY(worldToLocal: Matrix4d, geometryA: GeometryQuery, extendA: boolean, geometryB: GeometryQuery, extendB: boolean): CurveLocationDetailArrayPair {
    const handler = new CurveCurveIntersectXY(worldToLocal, geometryA, extendA, geometryB, extendB);
    geometryA.dispatchToGeometryHandler(handler);
    return handler.grabResults();
  }
  /**
   * Return full 3d xyz intersections of 2 curves.
   *  * Implemented for combinations of LineSegment3d, LineString3d, Arc3d.
   *  * Not Implemented for bspline and bezier curves.
   * @beta
   * @param geometryA second geometry
   * @param extendA true to allow geometryA to extend
   * @param geometryB second geometry
   * @param extendB true to allow geometryB to extend
   */
  public static intersectionXYZ(geometryA: GeometryQuery, extendA: boolean, geometryB: GeometryQuery, extendB: boolean): CurveLocationDetailArrayPair {
    const handler = new CurveCurveIntersectXYZ(geometryA, extendA, geometryB, extendB);
    geometryA.dispatchToGeometryHandler(handler);
    return handler.grabResults();
  }

}