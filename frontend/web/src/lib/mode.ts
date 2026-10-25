/** True unless NEXT_PUBLIC_USE_MOCKS=false. Feature clients pick Mock or Api from this. */
export const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
