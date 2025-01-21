import z from 'zod';

const objectPayloadSchema = z.preprocess(
  (val) => JSON.parse(val as string),
  z.object({})
);

function isObjectPayloadValid(payload: unknown): boolean {
  try {
    if (!objectPayloadSchema.safeParse(payload).success) {
      return false;
    }
    return true;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    error;
    return false;
  }
}

export { isObjectPayloadValid };
