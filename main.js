"use strict";

const TIMER_INTERVAL = 33;

var gKey = [];
var gImg;
var gTimer;

var mX = 0;
var mY = 0;

class Player
{
  constructor()
  {
    this.mX = 0;
    this.mY = 0;
  }
  
  static Tick()
  {
    if( gKey[ 37 ] ) mX -= 2;
    if( gKey[ 38 ] ) mY -= 2;
    if( gKey[ 39 ] ) mX += 2;
    if( gKey[ 40 ] ) mY += 2;
  }
}

function draw()
{
  let e = document.getElementById("main");
  let g = e.getContext("2d");
  g.imageSmoothingEnabled = g.imageSmoothingEnabled = false;
  g.fillStyle = "#000000";
  g.fillRect( 0, 0, 480, 160 );
  g.drawImage( gImg, 0, 0, 48, 16, mX, mY, 480, 160 );
}

function tick()
{
  Player.Tick();
}

function onPaint()
{
  if( !gTimer ){
    gTimer = performance.now();
  }

  if( gTimer + TIMER_INTERVAL < performance.now() ){
    gTimer += TIMER_INTERVAL;
    tick();
    draw();
  }
  requestAnimationFrame( onPaint );
}

window.onkeydown = function( ev )
{
  gKey[ ev.keyCode ] = true;
}

window.onkeyup = function( ev )
{
  gKey[ ev.keyCode ] = false;
}

window.onload = function()
{
  gImg = new Image();
  gImg.src = "shooting.png";
  gImg.onload = function()
  {
    requestAnimationFrame( onPaint );
  }
  
}