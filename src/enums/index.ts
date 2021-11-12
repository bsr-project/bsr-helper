export function hasFlag(flag: number, enums: number) {
  return flag === (enums & flag)
}
