let set_default = (default: 'a, opt: option('a)) =>
  switch (opt) {
  | Some(v) => v
  | None => default
  };

let (>>=) = (opt: option('a), fn: 'a => option('b)): option('b) =>
  switch (opt) {
  | Some(v) => fn(v)
  | None => None
  };

let (-?>) = (opt: option('a), fn: 'a => 'b): option('b) =>
  switch (opt) {
  | Some(v) => Some(fn(v))
  | None => None
  };