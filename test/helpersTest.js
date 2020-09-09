const { assert } = require('chai');

const { checkUserID } = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('checkUserID', function() {
  it('should return a user with valid email', function() {
    const user = checkUserID("user@example.com", users)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
    
  it('should return an empty string with an  invalid email', function() {
    const user = checkUserID("user2@example.com", users)
    const expectedOutput = "user2RandomID";
    assert.equal(user,expectedOutput);
  });


});