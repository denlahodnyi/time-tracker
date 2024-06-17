export default function exclude<Obj extends object, Key extends keyof Obj>(
  obj: Obj,
  keys: Key[],
): Omit<Obj, Key> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !(keys as string[]).includes(key)),
  ) as Omit<Obj, Key>;
}
