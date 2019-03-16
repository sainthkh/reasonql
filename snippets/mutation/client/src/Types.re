type status = 
  | Loaded
  | Waiting
  ;

type tweet = {
  id: string,
  text: string,
  status: status,
};