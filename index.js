/**
 * Don't change these constants!
 */
const DODGER = document.getElementById('dodger')
const GAME = document.getElementById('game')
const SCORE = document.getElementById("score"); 
const GAME_HEIGHT = 400
const GAME_WIDTH = 400
const LEFT_ARROW = 37
const RIGHT_ARROW = 39
const ROCKS = []
const MESSAGES = []; 
const START = document.getElementById('start')

var gameInterval = null
var rockCountdown = null;
var idleCountdown = null; 
var deactivateBonusCountdown = null;

var scoreCounter = 0; 
var maxScore = 10000;
var scoreIncrement = 1;
var closeBonusIncrement = 10;
var closeBonusDistance = 50; 
var bonusActive = false;

var rockMinSpeed = 2.5;
var rockMaxSpeed = 10;
var currentRockSpeed = rockMinSpeed;
var minRockCountDown = 500;
var idleRockCountdown = 1000; 

var leftDown = false;
var rightDown = false;
var isMoving = false;
var dodgerSpeed = 4;

function checkCollision(rock) {

  const top = positionToInteger(rock.style.top)

  // rocks are 20px high
  // DODGER is 20px high
  // GAME_HEIGHT - 20 - 20 = 360px;

  // If the rock has reached the dodger at the bottom of the screen, then check the x for collision. 
  if (top > 360) {

    const dodgerLeftEdge = positionToInteger(DODGER.style.left)
    const dodgerRightEdge = dodgerLeftEdge + 40;
    const rockLeftEdge = positionToInteger(rock.style.left)
    const rockRightEdge = rockLeftEdge + 20;

    if (rockLeftEdge <= dodgerLeftEdge && rockRightEdge >= dodgerLeftEdge) {
      return true;
    } else if (rockLeftEdge >= dodgerLeftEdge && rockRightEdge <= dodgerRightEdge) {
      return true; 
    } else if (rockLeftEdge <= dodgerRightEdge && rockRightEdge >= dodgerRightEdge) {
      return true;
    }    
      
    // If not a hit, check for distance, if dodger is close enough to rock, then award extra pointz! 
    const dodgerCenter = positionToInteger(DODGER.style.left) + 20;
    const rockCenter = positionToInteger(rock.style.left) + 10;
    const centerDiff = Math.abs(dodgerCenter - rockCenter); 

    if (deactivateBonusCountdown === null && centerDiff < closeBonusDistance) {
      // Activate dat bonus! 
      bonusActive = true;
      SCORE.id = "bonusScore";
      createMessage(); 
      // Deactivate the bonus after a certain amount of time, depending on how close you were to getting hit. 
      let bonusTime = Math.abs(closeBonusDistance / centerDiff) * 3000; 
      console.log("BONUS TIME: " + bonusTime);
      deactivateBonusCountdown = setTimeout(function() {
        deactivateBonusCountdown = null;
        bonusActive = false;
        SCORE.id = "score"; 
      }, bonusTime); 
    }
  }
}

function createRock(x) {

  const rock = document.createElement('div')

  rock.className = 'rock'
  rock.style.left = `${x}px`

  var top = 0

  rock.style.top = top

  GAME.appendChild(rock);

  function moveRock() {

    currentRockSpeed = lerpClamped(rockMinSpeed, rockMaxSpeed, scoreCounter / maxScore); 
    rock.style.top = `${top += currentRockSpeed}px`;

    if (checkCollision(rock)) {
      return endGame(); 
    }
    
    if (top < GAME_HEIGHT) {
      if (top > GAME_HEIGHT - 20) {
        let bonusMultiplier = (bonusActive ? 10 : 1); 
        updateScore(scoreCounter + (scoreIncrement * bonusMultiplier)); 
      }
      window.requestAnimationFrame(moveRock); 
    } else {
      rock.remove();
    }
  }

  window.requestAnimationFrame(moveRock); 
  ROCKS.push(rock)
  return rock
}

function updateScore(newScore) {
  scoreCounter = newScore; 
  SCORE.innerHTML = "Score: " + scoreCounter;
}

function lerpClamped(start, end, interpolant) {
  if (interpolant > 1) { 
    interpolant = 1; 
  } else if (interpolant < 0) { 
    interpolant = 0; 
  }
  return lerpUnclamped(start, end, interpolant);
}

function lerpUnclamped(start, end, interpolant) {
  let diff = end - start;
  return (diff * interpolant) + start;
}

function endGame() {

  // clearInterval(gameInterval); 
  stopDodger();
  clearTimeout(rockCountdown); 
  clearTimeout(idleCountdown); 
  removeEventListener("keyup", stopDodger); 
  removeEventListener('keydown', moveDodger); 
  

  ROCKS.forEach(function(rock) {
    // rock.remove(); 
  })

  MESSAGES.forEach(function(msg) {
    msg.remove();
  })

  // alert("You lose!"); 
  START.innerText = "AGAIN?";
  START.style.display = "initial";
}

function moveDodger(e) {

  // Use isMoving bool to see if recursive moveDodgerLeft/Right functions have already been called. 
  // If we don't do this - while a key is held down, the move functions will get called repeatedly from this function, causing jittery movement. 

  switch(e.which) {
    case LEFT_ARROW:

      clearTimeout(idleCountdown); 

      leftDown = true;

      if (rightDown) {
        rightDown = false;
        isMoving = false;
      }

      if (!isMoving) {
        moveDodgerLeft();
        isMoving = true;
      }  

      break;

    case RIGHT_ARROW:

      clearTimeout(idleCountdown); 

      rightDown = true;
      

      if (leftDown) {
        leftDown = false;
        isMoving = false;
      }

      if (!isMoving) {
        moveDodgerRight();
        isMoving = true;
      }  

      break;
  }
}

function moveDodgerLeft() {
  var currentPos = positionToInteger(DODGER.style.left);

  function step() {
    if (leftDown && currentPos > 0) {
      DODGER.style.left = `${currentPos -= dodgerSpeed}px`;
      window.requestAnimationFrame(step); 
    } 
  }
  
  step(); 
}

function moveDodgerRight() {
  var currentPos = positionToInteger(DODGER.style.left);

  function step() {
    if (rightDown && currentPos < GAME_WIDTH - 40) {
      DODGER.style.left = `${currentPos += dodgerSpeed}px`;
      window.requestAnimationFrame(step); 
    } 
  }

  step(); 
}

function keyUp(e) {
  switch(e.which) {
    case LEFT_ARROW:
      leftDown = false;
      break;

    case RIGHT_ARROW:
      rightDown = false;
      break;
  }

  if (!leftDown && !rightDown) {
    stopDodger();
  }
}

function stopDodger() {
  // If game hasn't ended yet, start a timer that spawns a rock directly above the player if they idle too long. 
  if (START.style.display === "none") {
    idleCountdown = setTimeout(function() {
      abovePlayer = positionToInteger(DODGER.style.left) + 10;
      createRock(abovePlayer); 
    }, idleRockCountdown); 
  }
  isMoving = false;
}

function setGameInterval(speed) {
  clearInterval(gameInterval); 
  gameInterval = setInterval(function() {
    createRock(Math.floor(Math.random() *  (GAME_WIDTH - 20)))
  }, speed); 
}

function setRockCountdown(time) {
  createRock(Math.floor(Math.random() * (GAME_WIDTH - 20))); 

  let newCountdownTime = 1000 - (1000 * (scoreCounter/maxScore));
  if (newCountdownTime < minRockCountDown) { newCountdownTime = minRockCountDown; }
  rockCountdown = setTimeout(function() {
    setRockCountdown(1000); 
  }, newCountdownTime); 
}

function createMessage(parentElement) {
  let msg = document.createElement("div");
  msg.className = "message";
  msg.innerText = "CLOSE ONE!";
  MESSAGES.push(msg); 
  GAME.appendChild(msg); 
  
  let duration = durationToInteger(msg.style.animationDuration); 
  setTimeout(function() {
    clearMessage(msg); 
  }, 3000); 
}

function clearMessage(msg) {
  msg.remove();
}

/**
 * @param {string} p The position property
 * @returns {number} The position as an integer (without 'px')
 */
function positionToInteger(p) {
  return parseInt(p.split('px')[0]) || 0
}

function durationToInteger(p) {
  return parseInt(p.split("s")[0]) || 0; 
}

function start() {

  updateScore(0); 

  window.addEventListener('keydown', moveDodger)
  window.addEventListener("keyup", keyUp);

  START.style.display = 'none'

  rockCountdown = setTimeout(function() {
    setRockCountdown(1000); 
  }, 1000); 
}
