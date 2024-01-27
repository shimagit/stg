"use strict";

const TIMER_INTERVAL = 33;
const WIDTH = 240;
const HEIGHT = 180;

var gG;
var gGameOver;
var gKey = [];
var gImg;
var gScreen;
var gTimer;

class Character
{
  constructor( idx )
  {
    this.mIdx = idx;
  }

  contains()
  {
    return( this.mX >= -16 && this.mX < WIDTH &&
            this.mY >= -16 && this.mY < HEIGHT );
  }

  draw()
  {
    gG.drawImage( gImg, this.mIdx * 16, 0, 16, 16, this.mX, this.mY, 16, 16 ); 
  }

  isInCircle( x, y, s )
  {
    let dx = this.mX + 8 - x;
    let dy = this.mY + 8 - y;
    return( dx * dx + dy * dy < s );

  }

  tick()
  {
    if( !this.mVisible ){
      return;
    }
    
    this.mX += this.mDX;
    this.mY += this.mDY;
    this.mVisible = this.contains();
  }
}


class Enemy extends Character
{
  static sObj = new Enemy();

  constructor()
  {
    super( 1 );
    this.mX = 100;
    this.mY = -15;
    this.mDX = 0;
    this.mDY = 1;
  }

  static Appear()
  {
    let o = Enemy.sObj;

    o.mX = Math.floor( Math.random() * WIDTH ) - 8;
    o.mY = -15;
    o.mDX = 0;
    o.mDY = 1;
    o.mVisible = true;
  }

  static Draw()
  {
    Enemy.sObj.draw();
  }

  static IsInCircle( x, y )
  {
    return( Enemy.sObj.isInCircle( x, y, 100 ) );
  }

  static Tick()
  {
    Enemy.sObj.tick();
    if( !Enemy.sObj.mVisible ){
      Enemy.Appear();
    }
  }
}

class Missile extends Character
{
  static sObj = new Missile();
  
  constructor()
  {
    super( 2 );
    this.mDX = 0;
    this.mDY = -8;
  }
  
  static Draw()
  {
    Missile.sObj.draw();
  }

  static Tick()
  {
    let o = Missile.sObj;
    o.tick();
    if( !o.mVisible ){
      o.mVisible = true;
      o.mX = Player.sObj.mX;
      o.mY = Player.sObj.mY;
    }

    if( Enemy.IsInCircle( o.mX + 8, o.mY + 8, 100 )){
      Enemy.sObj.mVisible = false;
      o.mVisible = false;
    }
  }
}


class Player extends Character
{
  static sObj = new Player();

  constructor()
  {
    super( 0 );
    this.mX = 112;
    this.mY = 160;
  }
  
  static Draw()
  {
    Player.sObj.draw();
  }

  static Tick()
  {
    let o = Player.sObj;
    if( gKey[ 37 ] ) o.mX -= 2;
    if( gKey[ 38 ] ) o.mY -= 2;
    if( gKey[ 39 ] ) o.mX += 2;
    if( gKey[ 40 ] ) o.mY += 2;

    gGameOver = Enemy.IsInCircle( o.mX + 8, o.mY + 8 );
  }
}

function draw()
{
  gG.fillStyle = "#000000";
  gG.fillRect( 0, 0, gScreen.width, gScreen.height );

  Player.Draw();
  Enemy.Draw();
  Missile.Draw();

  let e = document.getElementById("main");
  let g = e.getContext("2d");
  g.imageSmoothingEnabled = g.msImageSmoothingEnabled = false;
  g.drawImage( gScreen, 0, 0, gScreen.width, gScreen.height, 0, 0, e.width, e.height );

  // Player.Draw();
}

function tick()
{
  if( gGameOver ){
    return;
  }

  Player.Tick();
  Missile.Tick();
  Enemy.Tick();
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
    gScreen = document.createElement( "canvas" );
    gScreen.width = WIDTH;
    gScreen.height = HEIGHT;
    gG = gScreen.getContext( "2d" );
    requestAnimationFrame( onPaint );
  }
  
}