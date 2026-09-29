/** Filter the already released library without adding categories or granting access. */
export function matchesShareSelection(asset,lane="",kind=""){
  return (!lane||Boolean(asset.lanes?.includes(lane)))&&
    (!kind||(kind==="invitation"?["invitation","course"].includes(asset.asset_type):asset.asset_type===kind));
}
