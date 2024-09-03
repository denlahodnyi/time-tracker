export default async function parseRequestFormData<T>(
  request: Request,
): Promise<T> {
  return Object.fromEntries(await request.formData()) as T;
}
