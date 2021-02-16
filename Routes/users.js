const { json } = require("express");
const express = require("express");
const router = express.Router();
const mysql  = require("mysql");
const db = require("../connection");
const { v4: uuidv4, validate } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const AWS = require("aws-sdk");

const multerStorage = multer.memoryStorage({
  destination: function(req, file, callback) {
    callback(null, '');
  }
});

const upload = multer({storage: multerStorage}).single('image');
const uploads = multer({storage: multerStorage}).array('images', 4);

const s3 = new AWS.S3({
  accessKeyId:process.env.AWS_ACCESS_ID,
  secretAccessKey:process.env.AWS_ACCESS_SECRET_KEY
});

// /search is a route that returns a user object
// after a user queries for a specific entry in user table
router.get("/search", (req, res) => {
    console.log("Conducting user search within database.");
    const user = req.query.username;
    const user_query = `SELECT users.user_id, users.username, users.profile_image_1, users.age FROM MarauderDB.users
                        WHERE username LIKE '${user}%'
                        LIMIT 10;`;
    db.query(user_query, (err, result) => {
        if(err) {
          console.log("MarauderAPI - /validate_email has encountered an error while validating email, err: ", err);
          return res.sendStatus(500);
        }
        return res.send(result);
    });
});

// /validate_number is a route that validates for unique phone
// numbers when a new user is onboarding
router.get("/validate_number", (req, res) => {
    console.log("Validating for unique phone number within database.");
    const incoming_number = req.query.phone_number;
    const validation_query = `SELECT * FROM MarauderDB.users WHERE phone_number = '${incoming_number}'`;
    db.query(validation_query, (err, result) => {
        if (err) {
          console.log("MarauderAPI - /validate_number has encountered an error while validating number, err: ", err);
          return res.sendStatus(500);
        }
        if(result[0] == null) {
            console.log("MarauderAPI - /validate_number has encountered no known number of input value.");
            return res.json("Phone Number Validated");
        } else {
            console.log("MarauderAPI - /validate_number has encountered an existing entry of input value.");
            return res.sendStatus(409);
        }
    });
});

// /validate_username is a route that validates for a unique 
// username when a new user is onboarding
router.get("/validate_username", (req, res) => {
    console.log("Validating for unique username for new user.");
    const username = req.query.username;
    var validate_email_query = `SELECT * FROM MarauderDB.users WHERE username = '${username}';`;
    db.query(validate_email_query, (err, result) => {
        if(err){
          console.log("MarauderAPI - /validate_email has encountered an error while validating email, err: ", err);
          return res.sendStatus(500);
        }
        if(result[0] == null) {
          console.log("MarauderAPI - /validate_username has encountered no known username of input value.");
          return res.json("Username validated");
        } else {
          return res.sendStatus(409);
        }
    });
});

// /register is a route that inputs a new user into the database
// when a new user is being onboarded
router.post("/register", (req, res) => {
  const uniqueId = uuidv4();

  const user = {
    user_id: uniqueId,
    phone_number: req.body.phone_number,
    username: req.body.username,
    age: req.body.age,
    gender: req.body.gender,
    range: req.body.range,
    lower_match_age: req.body.lower_match_age,
    upper_match_age: req.body.upper_match_age,
    match_male: req.body.match_male,
    match_female: req.body.match_female,
    match_nonbinary: req.body.match_nonbinary,
    profile_image_1: req.body.profile_image_1,
    profile_image_2: req.body.profile_image_2,
    profile_image_3: req.body.profile_image_3,
    profile_image_4: req.body.profile_image_4,
    profile_caption: req.body.profile_caption,
    is_account_paused: req.body.is_account_paused
  };

  var insert_user_querry = `INSERT INTO users SET ?`;

  db.query(insert_user_querry, user, (err, result) => {
    if (err) {
      console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
      return res.sendStatus(500);
    }

    // const secret = process.env.SECRET;
    // var token = jwt.sign(uniqueId, secret, {
    //   expiresIn: '7d'
    // });

    console.log("MarauderAPI - /login POST registed new user: ", user.user_id);
    return res.json(
      {
        "user_id":uniqueId,
        "token":"12345"
      });
  });
});

// /login is a route that allows an existing user to be logged in
// 
router.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  const targetted_email = req.body.email;
  const getUserByEmailQuerry = `SELECT * FROM users WHERE email = '${targetted_email}';`;

  db.query(getUserByEmailQuerry, (err, rows) => {
    if(err) {
      return res.send(err);
    }
    if(rows === undefined || rows.length == 0) {
      console.log("MarauderAPI - /login POST Request Failed to find user with specified email, prompt signup instead.");
      return res.sendStatus(422);
    }
    queried_password = rows[0].password;
    if(bcrypt.compareSync(req.body.password, queried_password)) {
      console.log("MarauderAPI - /login POST Request Validation Returns: ", true);
      return res.sendStatus(200);
    } else {
      console.log("MarauderAPI - /login POST Request Validation Returns: ", false);
      return res.sendStatus(403);
    }    
  });
});

// /images_upload is a route that uploads a single image into the backend
//
router.post("/image_upload", upload, (req, res) => {
  const random_file_name = uuidv4();
  let myFile = req.file.originalname.split('.');
  const fileType = myFile[myFile.length-1];
  const params = {
    Bucket: process.env.BUCKET,
    Key: random_file_name + '.' + fileType,
    Body: req.file.buffer,
    ACL: 'public-read'
  };
  s3.upload(params, (err, data) => {
    if(err) {
      return res.sendStatus(500).send(err);
    }
  });
  return res.json({"url":"https://marauderimages.s3.us-east-2.amazonaws.com/"+random_file_name+'.'+fileType});
});

router.post("/images_upload", uploads, (req, res) => {
  const image_array = req.files;
  const json_return_object = {};
  for(i = 0; i < image_array.length; i++) {
    const random_file_name = uuidv4();
    let file = image_array[i].originalname.split('.');
    const file_extension = file[file.length-1];
    json_return_object["image"+i] = "https://marauderimages.s3.us-east-2.amazonaws.com/" + random_file_name + "." + file_extension;
    const params = {
      Bucket: process.env.BUCKET,
      Key: random_file_name + '.' + file_extension,
      Body: image_array[i].buffer,
      ACL: 'public-read'
    };
    s3.upload(params, (err, data) => {
      if(err) {
        return res.sendStatus(500).send(err);
      }
    });
  }  
  return res.json(json_return_object);
});

router.put("/images_update/profile_image_1/:id", upload, (req, res) => {
  const user_id = req.params.id;
  const new_file_name = uuidv4();
  let myFile = req.file.originalname.split('.');
  const file_extension = myFile[myFile.length-1];
  const new_url = "https://marauderimages.s3.us-east-2.amazonaws.com/" + new_file_name + "." + file_extension;
  
  const getImageQuery = `SELECT MarauderDB.users.profile_image_1 FROM MarauderDB.users WHERE user_id = '${user_id}';`;
  db.query(getImageQuery, (err, result) => {
    if (err) {
      console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
      return res.sendStatus(500);
    }
    var url_split = result[0].profile_image_1.split("/");
    const key = url_split[url_split.length-1];
    
    var delete_params = {Bucket: process.env.BUCKET, Key: key};
    s3.deleteObject(delete_params, function(err, data) {
      if (err) {
        return res.sendStatus(500).send(err);
      }
    });

    var upload_params = { Bucket: process.env.BUCKET,
                          Key: new_file_name + '.' + file_extension,
                          Body: req.file.buffer,
                          ACL: 'public-read' }
    s3.upload(upload_params, (err, data) => {
      if(err) {
        return res.sendStatus(500).send(err);
      }
    });

    const updateUserImageQuery = `UPDATE MarauderDB.users SET profile_image_1 = '${new_url}' WHERE user_id = '${user_id}';`;
    db.query(updateUserImageQuery, (err, result) => {
      if (err) {
        console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
        return res.sendStatus(500);
      }
      return res.json("Success.")
    });
  });
}); 

router.put("/images_update/profile_image_2/:id", upload, (req, res) => {
  const user_id = req.params.id;
  const new_file_name = uuidv4();
  let myFile = req.file.originalname.split('.');
  const file_extension = myFile[myFile.length-1];
  const new_url = "https://marauderimages.s3.us-east-2.amazonaws.com/" + new_file_name + "." + file_extension;
  
  const getImageQuery = `SELECT MarauderDB.users.profile_image_2 FROM MarauderDB.users WHERE user_id = '${user_id}';`;
  db.query(getImageQuery, (err, result) => {
    if (err) {
      console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
      return res.sendStatus(500);
    }
    var url_split = result[0].profile_image_2.split("/");
    const key = url_split[url_split.length-1];
    
    var delete_params = {Bucket: process.env.BUCKET, Key: key};
    s3.deleteObject(delete_params, function(err, data) {
      if (err) {
        return res.sendStatus(500).send(err);
      }
    });

    var upload_params = { Bucket: process.env.BUCKET,
                          Key: new_file_name + '.' + file_extension,
                          Body: req.file.buffer,
                          ACL: 'public-read' }
    s3.upload(upload_params, (err, data) => {
      if(err) {
        return res.sendStatus(500).send(err);
      }
    });

    const updateUserImageQuery = `UPDATE MarauderDB.users SET profile_image_2 = '${new_url}' WHERE user_id = '${user_id}';`;
    db.query(updateUserImageQuery, (err, result) => {
      if (err) {
        console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
        return res.sendStatus(500);
      }
      return res.json("Success.")
    });
  });
}); 

router.put("/images_update/profile_image_3/:id", upload, (req, res) => {
  const user_id = req.params.id;
  const new_file_name = uuidv4();
  let myFile = req.file.originalname.split('.');
  const file_extension = myFile[myFile.length-1];
  const new_url = "https://marauderimages.s3.us-east-2.amazonaws.com/" + new_file_name + "." + file_extension;
  
  const getImageQuery = `SELECT MarauderDB.users.profile_image_3 FROM MarauderDB.users WHERE user_id = '${user_id}';`;
  db.query(getImageQuery, (err, result) => {
    if (err) {
      console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
      return res.sendStatus(500);
    }
    var url_split = result[0].profile_image_3.split("/");
    const key = url_split[url_split.length-1];
    
    var delete_params = {Bucket: process.env.BUCKET, Key: key};
    s3.deleteObject(delete_params, function(err, data) {
      if (err) {
        return res.sendStatus(500).send(err);
      }
    });

    var upload_params = { Bucket: process.env.BUCKET,
                          Key: new_file_name + '.' + file_extension,
                          Body: req.file.buffer,
                          ACL: 'public-read' }
    s3.upload(upload_params, (err, data) => {
      if(err) {
        return res.sendStatus(500).send(err);
      }
    });

    const updateUserImageQuery = `UPDATE MarauderDB.users SET profile_image_3 = '${new_url}' WHERE user_id = '${user_id}';`;
    db.query(updateUserImageQuery, (err, result) => {
      if (err) {
        console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
        return res.sendStatus(500);
      }
      return res.json("Success.")
    });
  });
}); 

router.put("/images_update/profile_image_4/:id", upload, (req, res) => {
  const user_id = req.params.id;
  const new_file_name = uuidv4();
  let myFile = req.file.originalname.split('.');
  const file_extension = myFile[myFile.length-1];
  const new_url = "https://marauderimages.s3.us-east-2.amazonaws.com/" + new_file_name + "." + file_extension;
  
  const getImageQuery = `SELECT MarauderDB.users.profile_image_4 FROM MarauderDB.users WHERE user_id = '${user_id}';`;
  db.query(getImageQuery, (err, result) => {
    if (err) {
      console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
      return res.sendStatus(500);
    }
    var url_split = result[0].profile_image_4.split("/");
    const key = url_split[url_split.length-1];
    
    var delete_params = {Bucket: process.env.BUCKET, Key: key};
    s3.deleteObject(delete_params, function(err, data) {
      if (err) {
        return res.sendStatus(500).send(err);
      }
    });

    var upload_params = { Bucket: process.env.BUCKET,
                          Key: new_file_name + '.' + file_extension,
                          Body: req.file.buffer,
                          ACL: 'public-read' }
    s3.upload(upload_params, (err, data) => {
      if(err) {
        return res.sendStatus(500).send(err);
      }
    });

    const updateUserImageQuery = `UPDATE MarauderDB.users SET profile_image_4 = '${new_url}' WHERE user_id = '${user_id}';`;
    db.query(updateUserImageQuery, (err, result) => {
      if (err) {
        console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
        return res.sendStatus(500);
      }
      return res.json("Success.")
    });
  });
}); 














router.put("/settings/match_male/:id", (req, res) => {
  const user_id = req.params.id;
  const match_male = req.body.match_male;
  const updateMatchMaleQuery = `UPDATE users SET match_male = ${match_male} WHERE user_id = '${user_id}';`;

  db.query(updateMatchMaleQuery, (err, result) => {
    if (err) {
      console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
      return res.sendStatus(500);
    }
    return res.json("Success.")
  });
});

router.put("/settings/match_female/:id", (req, res) => {
  const user_id = req.params.id;
  const match_female = req.body.match_female;
  const updateMatchFemaleQuery = `UPDATE users SET match_female = ${match_female} WHERE user_id = '${user_id}';`;

  db.query(updateMatchFemaleQuery, (err, result) => {
    if (err) {
      console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
      return res.sendStatus(500);
    }
    return res.json("Success.")
  });
});

router.put("/settings/match_nonbinary/:id", (req, res) => {
  const user_id = req.params.id;
  const match_nonbinary = req.body.match_nonbinary;
  const updateMatchNonBinaryQuery = `UPDATE users SET match_nonbinary = ${match_nonbinary} WHERE user_id = '${user_id}';`;

  db.query(updateMatchNonBinaryQuery, (err, result) => {
    if (err) {
      console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
      return res.sendStatus(500);
    }
    return res.json("Success.")
  });
});

router.put("/settings/pause_account/:id", (req, res) => {
  const user_id = req.params.id;
  const pause_account = req.body.pause_account;
  const updatePauseAccountQuery = `UPDATE users SET is_account_paused = ${pause_account} WHERE user_id = '${user_id}';`;

  db.query(updatePauseAccountQuery, (err, result) => {
    if (err) {
      console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
      return res.sendStatus(500);
    }
    return res.json("Success.")
  });
});

router.put("/settings/update_venue_range/:id", (req, res) => {
  const user_id = req.params.id;
  const venue_range = req.body.venue_range;
  const updateVenueRangeQuery = `UPDATE users SET MarauderDB.users.range = ${venue_range} WHERE user_id = '${user_id}';`;

  db.query(updateVenueRangeQuery, (err, result) => {
    if (err) {
      console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
      return res.sendStatus(500);
    }
    return res.json("Success.")
  });
});

router.put("/settings/update_match_age/:id", (req, res) => {
  const user_id = req.params.id;
  const lower_match = req.body.lower_match_age;
  const upper_match = req.body.upper_match_age;
  const updateAgeMatchQuery = `UPDATE users SET MarauderDB.users.lower_match_age = ${lower_match}, MarauderDB.users.upper_match_age = ${upper_match} WHERE user_id = '${user_id}';`;
  db.query(updateAgeMatchQuery, (err, result) => {
    if (err) {
      console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
      return res.sendStatus(500);
    }
    return res.json("Success.")
  });
});

router.post("/test_generate_web_token", (req, res) => {
  const user = {"user_id":req.body.user_id}
  const secret = process.env.SECRET;
  var token = jwt.sign(user, secret, {
    expiresIn: '30s'
  });
  return res.json({"access_token":token});
});

router.post("/validate_web_token", authenticateToken, (req, res) => {
  jwt.verify(req.token, process.env.SECRET, (err, authData) => {
    if(err) {
      return res.sendStatus(403);
    } else {
      console.log(authData);
      return res.sendStatus(200);
    }
  });
});

function authenticateToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const token  = bearer[1];
      req.token = token;
      next();
    } else {
      res.sendStatus(403);
    }
}

module.exports = router;