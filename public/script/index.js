console.log("CONNECTED");



//Every function, and config info stored inside GAME object
var game = {
  //variable for easy and hard mode changing
  hardMode: false,

  //GameInfo store table data, mines, how many table cell should we sweep, and time data
  gameInfo: {},

  //start the Game, stop the Game, lose and win the game
  gameEvents: {

    //stargame() is just calling functions in the correct order, and updates the game object
    startGame: function(width, height, mines){
      //If for some reason, we don't already stoped the game
      if(game.gameInfo.isOn){
        game.gameEvents.stopGame();
      }
      //Hide previous message & new game buttun
      $("#message").html("");
      $("#newGame").hide();
      //define or update object information
      game.gameInfo = {
        isOn: true,
        width: width,
        height: height,
        mines: mines,
        toSweep: (width * height)-mines,
        time: {
          secs: 0,
          mins: 0,
          hours: 0
        }
      }
      //Render the table
      game.render.renderField(width, height);
      //Place the mines
      game.render.addMines(width, height, mines);
      //Start counting time
      game.display.setDisplay();
      //Listen to the player
      game.playerEvents.listen();
    },

    //Show where the mines are, and write out GAME OVER text
    loseGame: function(){
      //Show where unmarked mine are
      $(".mine").each(function(index, item){
        var cell = $(item);
        if(!(cell.hasClass("marked"))){
          cell.children().append("<i class='fas fa-2x fa-bomb'></i>");
        }
      });
      //Show if a makred cell is not a mine
      $(".marked").each(function(index, item){
        cell = $(item);
        if(!(cell.hasClass("mine"))){
          cell.children().children().css({"color": "red"});
        }
      });
      $("#message").html("Legközelebb talán nagyobb szerencséd lesz!");
      this.stopGame();
    },

    //Display a cheering text, updates display, mark unmarked mines, and updates display
    winGame: function(){
      //Show the mines
      $(".mine").each(function(index, item){
        var cell = $(item)
        if(!(cell.hasClass("marked"))){
          game.playerEvents.mark(cell);
        }
      });
      //Cheer^^
      $("#message").html("Gratulálunk, nyertél!");
      //0 mines should be left out
      $("#disMine").html("0");
      this.stopGame();
    },

    //Clear interval, and changes isOn variable
    stopGame: function() {
      game.gameInfo.isOn = false;
      clearInterval(game.gameInfo.timer);
      $("#newGame").show();
    },
  },

  //New game, difficulty changer *func ref missing*
  buttons: {
    //Starting new game
    newGame: function (){
      //we call the changeDifficulty(), but change the difficulty before, so the function changes it back, be like no difficulty changed
      game.hardMode = !game.hardMode;
      game.buttons.changeDifficulty();
    },

    //Change difficulty from easy to hard and reverse
    changeDifficulty: function(){
      game.hardMode = !game.hardMode;
      $("#difChanger").children().removeClass("inactive");
      if(game.hardMode){
        $("#difChanger .easy").addClass("inactive");
        game.gameEvents.startGame(16, 16, 40);
      } else {
        $("#difChanger .hard").addClass("inactive");
        game.gameEvents.startGame(9, 9, 10);
      }
    }
  },

  //Display and timer stuff
  display: {

    //Display the game info instead of sample text
    setDisplay: function() {
      //Display the amount of mines
      $("#disMine").html(game.gameInfo.mines);
      //Start counting tim note: timer calls the displayTime funcion, we don't need to call here
      game.gameInfo.timer = setInterval(game.display.countTime, 1000);
    },

    //This function just count the time
    countTime: function(){
      var data = game.gameInfo;
      if (data.isOn){
        //We check if we should win
        if(data.toSweep < 1){
          game.gameEvents.winGame();
        }
        //Count a secound
        data.time.secs++;
        //refresh the stored time
        if (data.time.secs > 59){
          data.time.secs = 0;
          data.time.mins++;
        }
        if (data.time.mins > 59) {
          data.time.mins = 0;
          data.time.hours++;
        }
        //Now we just need to display them
        game.display.displayTime(data.time.secs, $("#secDisplay"));
        game.display.displayTime(data.time.mins, $("#minDisplay"));
        game.display.displayTime(data.time.hours, $("#hDisplay"));
      }
    },

    //Display given time
    displayTime: function(time, display){
      //Should wi write 0 before?
      if(time < 10){
        display.html("0" + time);
      } else {
        //If we should not, just display it
        display.html(time);
      }
    }

  },

  //create game tabel, add mines
  render: {

    //HERE WE CRATE AN AMAZING TABLE FOR OUR GAME WHERE WE CAN PLAY
    renderField: function(width, height) {
      //Delete the previous gameField
      if ($(".playArea").length > 0){
        $(".gameField").remove();
      }
      //Render a new one
      //first render a table
      $(".playArea").append("<table class='gameField'></table>");
      //Then render rows for the table
      for (var i = 0; i < height; i++){
        $(".gameField").append("<tr class='gameRow' id='row-" + i + "'>");
        //In one row, render cels
        for (var j = 0; j < width; j++) {
          $("#row-" + i).append("<td class='gameCel' id='" + i + "-" + j + "'><div></div></td>");
        }
      }
    },

    //This function choose what cells shuld be dangeuras
    addMines: function(width, height, mines){
      /*
        "Drop the mines in the river!"
            /Kim Joung Um/
      */
      //Check if there is too much mine
      if (width * height <= mines) {
        alert("The game would be unplayable with so much mine!");
      } else {
        //Place as many mines as given
        for (var i = 0; i < mines; i++) {
          //Random x & y coordinate
          var x = Math.floor(Math.random() * width);
          var y = Math.floor(Math.random() * height);
          //Choose cell with the random coordinates
          var choosenCell = $("#" + x + "-" + y);
          while(choosenCell.hasClass("mine")){
            //If the choosen cell is already a mine, choose a new
            x = Math.floor(Math.random() * width);
            y = Math.floor(Math.random() * height);
            choosenCell = $("#" + x + "-" + y);
          }
          //If we finished to choose a correct cell,
          //Make it a mine
          choosenCell.addClass("mine");
        }
      }
    },

  },

  //Listening to player Clicks
  playerEvents: {

    //listening to click
    //This function should be called after we render the game area, and bombs
    //Here we just add the event listeners to cels
    listen: function(){
      $(".gameCel").click(function(){
        game.playerEvents.sweepCell($(this));
      });
      $(".gameCel").contextmenu(function(){
        game.playerEvents.mark($(this));
      });
    },

    //Called wehen Left click a cell
    //function for sweeping a clicked cell
    //Also call sweepArea
    sweepCell: function(cell){
      if(game.gameInfo.isOn){
        //We sweep it only if it's not a mine of course
        if(cell.hasClass("mine") && !cell.hasClass("marked")){
          game.gameEvents.loseGame();
        } else {
          //And if it is not already sweeped
          if(!(cell.hasClass("sweeped") || cell.hasClass("marked"))) {
            //Just sweep it
            cell.addClass("sweeped");
            var minesAround = game.find.countMines(cell);
            game.gameInfo.toSweep--;
            //If there is a mine around
            if(minesAround > 0){
              //We write out how many
              cell.children()[0].append(minesAround);
            } else {
              //If there isn't any mine around
              //We just sweep the cells around too
              this.sweepArea(cell);
            }
          }
        }
      }
    },

    //Method for sweeping an area if there is no mine around
    //Uses kinda the same logic as countMines()
    sweepArea: function(midCel){
      //get the correct coordinates
      var place, x, y;
      place = game.find.placeOf(midCel);
      y = place[0];
      x = place[1];
      //sweep cell around
      //Loop through the rows
      for (var i = (y-1); i <= (y+1); i++) {
        //loop throug the cels
        for (var j = (x-1); j <= (x+1); j++) {
          //Make sure slected is inside gameField
          if((i >= 0 && i < game.gameInfo.height) && (j >= 0 && j < game.gameInfo.width)){
            this.sweepCell($("#" + i + "-" + j));
          }
        }
      }
    },

    //Called when right click a cell
    //Mark a cel if we think it's a mine, and unmark if we changed our mind
    mark: function(cell){
      var data = game.gameInfo;
      if(data.isOn && !(cell.hasClass("sweeped"))){
        //We should check if the cel is already marked, and if we unmark it, otherwise we mark it
        //Luckily jQuery has got a function for it^^

        if(cell.hasClass("marked")){
          cell.toggleClass("marked");
          cell.children().children().remove();
          data.mines++;
          $("#disMine").html(data.mines);
        } else {
          cell.toggleClass("marked");
          cell.children().append("<i class='fas fa-2x fa-flag'></i>");
          data.mines--;
          $("#disMine").html(data.mines);
        }
      }
        /*
        "I DID NOT!
         Oh, Hi Mark!"
          /Johnny Wiseau/
      */
    }

  },

  //Return cell coordinates, count mines around 1 cell
  find: {

    //Counting the mines around a cel
    countMines: function(midCel){
      var foundMines = 0;
      //Get the coordinates
      var place, x, y;
      place = game.find.placeOf(midCel);
      y = place[0];
      x = place[1];

      //Go around the clicked cel
      //and count mines in the neighberhood
      //Loop through the rows above and below
      for(i = (y-1); i <= (y+1); i++){
        //Loop through cels
        for (var j = (x-1); j <= (x+1); j++){
          //check if we are on the gameField
          if((i >= 0 && i < game.gameInfo.height) && (j >= 0 && j < game.gameInfo.width)){
            //If actualy selected cel is a mine
            if($("#" + i + "-" + j).hasClass("mine")){
              //Count it
              foundMines++;
            }
          }
        }// END OF CELLS LOOP
      }// END OF ROWS LOOP
      return foundMines;
    },

    //some functions need the coordinates of each cel
    //This funcion is for them
    placeOf: function(cel){
      //We can find the coordinates in the id
      string = cel.attr("id");
      var x, y;
      //Find out if each coordinate is greater than 10
      var i = 0;
      do {
        i++;
      }while(string[i] != "-")
      //Convert the coordinates to numbers
      y = parseInt(string.substr(0, i));
      x = parseInt(string.substr(i+1, string.length));
      return [y, x];
    }

  }
}

//On the first load: start game with easy params
$(document).ready(function(){
  console.log("Page loaded");
  game.gameEvents.startGame(9, 9, 10);
});
