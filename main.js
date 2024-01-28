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

class Status
{
  static sScore = 0;

  static Draw( g )
  {
    g.font = "32px monospace";
    g.fillStyle = "#ffffff";
    g.fillText( "SCORE " + Status.sScore, 0, 32 );

  }
}

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
    if( this.mVisible ){
      gG.drawImage( gImg, this.mIdx * 16, 0, 16, 16, this.mX, this.mY, 16, 16 ); 
    }
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

class CharaMgr
{
  constructor()
  {
    this.mList = [];
  }

  draw()
  {
    for( let o of this.mList ){
      o.draw();
    }
  }

  searchInCircle( x, y, s )
  {
    for( let o of this.mList ){
      if( !o.mVisible || o.mCnt ){
        continue;
      }
      if( o.isInCircle( x, y, s )){
        return( o );
      }
    }
    return( null );
  }

  searchNoVisible()
  {
    for( let o of this.mList ){
      if( !o.mVisible ){
        return( o );
      }
    }
    return( null );
  }

  tick()
  {
    for( let o of this.mList ){
      o.tick();
    }
  }
}

class Bullet extends Character
{
  static sMgr = new CharaMgr();

  constructor()
  {
    super( 3 );
  }

  static Appear( x, y, typ = 3 )
  {
    if( typ == 4 ){
      Bullet.GetInstance().appear( x, y, Math.atan2( Player.sObj.mY - y, Player.sObj.mX - x ), 4, 2 );
      return;
    }
    for( let i = 0; i < 32; i++){
      Bullet.GetInstance().appear( x, y, Math.PI * i / 16 );
    }
  }

  static Draw()
  {
    Bullet.sMgr.draw();
  }

  static GetInstance()
  {
    let r = Bullet.sMgr.searchNoVisible();
    if( !r ){
      r = new Bullet();
      Bullet.sMgr.mList.push( r );
    }
    return( r );
  }

  static SearchInCircle( x, y )
  {
    return( Bullet.sMgr.searchInCircle( x, y, 16 ) );
  }

  static Tick()
  {
    Bullet.sMgr.tick();
  }

  appear( x, y, a, idx = 3, spd = 1 )
  {
    this.mX = x;
    this.mY = y;
    this.mDX = Math.cos( a ) * spd;
    this.mDY = Math.sin( a ) * spd;
    this.mIdx = idx;
    this.mVisible = true;
  }
}

class Enemy extends Character
{
  static sMgr = new CharaMgr();
  static sCount = 0;

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
    let o = Enemy.GetInstance();
    
    o.mX = Math.floor( Math.random() * WIDTH ) - 8;
    o.mY = -15;
    o.mDX = 0;
    o.mDY = 1;
    o.mIdx = 1;
    o.mVisible = true;
  }

  static Draw()
  {
    Enemy.sMgr.draw();
  }

  static GetInstance()
  {
    let r = Enemy.sMgr.searchNoVisible();
    if( !r ){
      r = new Enemy();
      Enemy.sMgr.mList.push( r );
    }
    return( r );
  }

  static SearchInCircle( x, y, s )
  {
    return( Enemy.sMgr.searchInCircle( x, y, s ) );
  }

  static Tick()
  {
    Enemy.sMgr.tick();
    if( Enemy.sCount++ > 20){
      Enemy.sCount = 0;
      Enemy.Appear();
    }
  }

  tick()
  {
    if( !this.mVisible ){
      return;
    }

    super.tick();
    
    if( Math.random() < 0.01 ){
      Bullet.Appear( this.mX, this.mY, 4 );
    }

    if( this.mCnt == 0 ){
      return;
    }

    if( --this.mCnt !=0 ){
      return;
    }

    if( this.mIdx < 8 ){
        this.mIdx++;
        this.mCnt = 4;
    }else{
      this.mVisible = false;
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

  static Shot()
  {
    let o = Missile.sObj;
    if( !o.mVisible ){
      o.mVisible = true;
      o.mX = Player.sObj.mX;
      o.mY = Player.sObj.mY;
    }
  }

  static Tick()
  {
    let o = Missile.sObj;
    if( !o.mVisible ){
      return;
    }

    o.tick();

    let e = Enemy.SearchInCircle( o.mX + 8, o.mY + 8, 200 );
    if( e ){
      e.mIdx = 5;
      e.mCnt = 8;
      e.mDY = 0;
      o.mVisible = false;
      Status.sScore += 100;
      Bullet.Appear( e.mX, e.mY );
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
    this.mVisible = true;
  }
  
  static Draw()
  {
    Player.sObj.draw();
  }

  static Tick()
  {
    let o = Player.sObj;
    if( gKey[ 37 ] && o.mX > 0 ) o.mX -= 2;
    if( gKey[ 38 ] && o.mY > 0 ) o.mY -= 2;
    if( gKey[ 39 ] && o.mX < WIDTH  - 16 ) o.mX += 2;
    if( gKey[ 40 ] && o.mY < HEIGHT - 16 ) o.mY += 2;
    if( gKey[ 90 ] ) Missile.Shot();

    let x = o.mX + 8;
    let y = o.mY + 8;
    gGameOver = ( Enemy.SearchInCircle( x, y, 100 ) != null ) ||
                ( Bullet.SearchInCircle( x, y ) != null );
  }
}

function draw()
{
  gG.fillStyle = "#000000";
  gG.fillRect( 0, 0, gScreen.width, gScreen.height );

  Player.Draw();
  Enemy.Draw();
  Missile.Draw();
  Bullet.Draw();

  let e = document.getElementById("main");
  let g = e.getContext("2d");
  g.imageSmoothingEnabled = g.msImageSmoothingEnabled = false;
  g.drawImage( gScreen, 0, 0, gScreen.width, gScreen.height, 0, 0, e.width, e.height );
  Status.Draw( g );

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
  Bullet.Tick();
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