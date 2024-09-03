export default function parseFormData<T>(formData: FormData): T {
  return Object.fromEntries(formData) as T;
}
