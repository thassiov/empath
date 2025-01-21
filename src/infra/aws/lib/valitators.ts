import z from 'zod';

const objectPayloadSchema = z
  .preprocess((val) => JSON.parse(val as string), z.object({}))
  .catch({ success: false });

function isObjectPayloadValid(payload: unknown): boolean {
  if (!objectPayloadSchema.safeParse(payload).success) {
    return false;
  }
  return true;
}

export { isObjectPayloadValid };
