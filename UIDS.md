<h1>UIDs</h1>

https://prabeshthapa.medium.com/optimizing-your-system-with-the-right-unique-id-uuid-ulid-or-nanoid-78bf8b7bf200

https://github.com/ulid/javascript?tab=readme-ov-file#monotonic-ulids
- ulid.monotonicFactory() generates uids in sorted order using current timestamp. If multiple ids are generated within the same timestamp, they will share the same timestamp but incremented randomness.
- ulid is not maintained anymore. Use ulidx: https://github.com/perry-mitchell/ulidx
- make sure to have validateId function for both ULID and UUID