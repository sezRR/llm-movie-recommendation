export default interface DecodedJWT {
    header: Record<string, unknown>
    payload: Record<string, unknown>
}