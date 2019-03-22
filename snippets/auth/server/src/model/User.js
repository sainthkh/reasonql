var users = {
  "ace@aaa.com": {
    password: "1234",
  },
  "good@bbb.net": {
    password: "5678",
  },
};

var userList = [
  "ace@aaa.com",
  "good@bbb.net",
]

function findById(id) {
  return users[userList[id]];
}

function findOne(email) {
  return users[email];
}

module.exports = {
  findById,
  findOne,
}