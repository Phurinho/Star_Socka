const fs = require("fs");

exports.addPlayerPage = (req, res) => {
  res.render("add-player.ejs", {
    title: "Welcome to socka | Add a new player",
    message: "",
  });
};

exports.addPlayer = (req, res) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }
  let message = "";
  let firstName = req.body.first_name;
  let lastName = req.body.last_name;
  let position = req.body.position;
  let number = req.body.number;
  let username = req.body.user_name;
  let uploadedFile = req.files.image;
  let imageName = uploadedFile.name;
  let fileExtension = uploadedFile.mimetype.split("/")[1];
  imageName = username + "." + fileExtension;

  let usernameQuery = "SELECT * FROM player WHERE user_name = ?";
  db.execute(usernameQuery, [username], (err, resulet) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    if (resulet.length > 0) {
      message = "Username already exists";
      res.render("add-player.ejs", {
        message,
        title: "Welcome to socka | Add a new player",
      });
    } else {
      //Check the filetype brfore uploading it
      if (
        uploadedFile.mimetype === "image/png" ||
        uploadedFile.mimetype === "image/jpeg" ||
        uploadedFile.mimetype === "image/gif"
      ) {
        uploadedFile.mv(`public/assets/img/${imageName}`, (err) => {
          if (err) {
            return res.status(500).send(err);
          }
          //send the player's details to the database
          let query =
            "INSERT INTO player(first_name, last_name, position, number, image,user_name) VALUES(?,?,?,?,?,?)";
          db.execute(
            query,
            [firstName, lastName, position, number, imageName, username],
            (err, result) => {
              if (err) {
                return res.status(500).send(err);
              }
              res.redirect("/");
            }
          );
        });
      } else {
        message =
          "Invalid file format. Only 'png','jpeg,'gif' images are allowed.";
        res.render("add-player.ejs", {
          message,
          title: "Welcome to socka | Add a new player",
        });
      }
    }
  });
};

exports.editPlayerPage = (req, res) => {
  let playerId = req.params.id;
  let query = "SELECT * FROM player WHERE id = ?";
  db.execute(query, [playerId], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.render("edit-player.ejs", {
      title: "Edit player",
      player: result[0],
      message: "",
    });
  });
};

exports.editPlayer = (req, res) => {
  let playerId = req.params.id;
  let firstName = req.body.first_name;
  let lastName = req.body.last_name;
  let position = req.body.position;
  let number = req.body.number;
  let username = req.body.user_name;
  let oldImage = req.body.old_image;
  let uploadedFile = req.files ? req.files.image : null;
  let imageName = oldImage; //Default to the old image

  if (uploadedFile) {
    let fileExtension = uploadedFile.mimetype.split("/")[1];
    imageName = username + "." + fileExtension;
    //Check if the uploaded file has a valid format
    if (
      uploadedFile.mimetype !== "image/png" &&
      uploadedFile.mimetype !== "image/jpeg" &&
      uploadedFile.mimetype !== "image/gif"
    ) {
      return res.render("edit-player.ejs", {
        message:
          "Invalid file format. Only 'png', 'jpeg', 'gif' images are allowed.",
        title: "Edit player",
      });
    }
  }
  if (uploadedFile) {
    uploadedFile.mv(`public/assets/img/${imageName}`, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
    });
  }
  let query =
    "UPDATE player SET first_name = ?,last_name = ?,position = ?,number= ?,image = ?, user_name = ? WHERE id = ?";
  db.execute(
    query,
    [firstName, lastName, position, number, imageName, username, playerId],
    (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.redirect("/");
    }
  );
};

exports.deletePlayer = (req, res) => {
  let playerId = req.params.id;
  let getImageQuery = "SELECT image FROM player WHERE id = ? ";
  let deleteUserQuery = "DELETE FROM player WHERE id = ?";

  db.execute(getImageQuery, [playerId], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }

    let image = result[0].image;

    fs.unlink(`public/assets/img/${image}`, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      db.execute(deleteUserQuery,[playerId],(err,result)=>{
        if(err){
            return res.status(500).send(err);
        }
        res.redirect('/');
      })
    });
  });
};
