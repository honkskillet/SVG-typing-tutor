//copyright alexander white
//all rights reservec
!function(){
  //solarized
  var colorPal={
    base03: '#002b36',
    base02: '#073642',
    base01: '#586e75',
    base00: '#657b83',
    base0:  '#839496',
    base1:  '#93a1a1',
    base2:  '#eee8d5',
    base3 : '#fdf6e3',// 15/7 brwhite  230 #ffffd7 97  00  10 253 246 227  44  10  99
    yellow: '#b58900',//  3/3 yellow   136 #af8700 60  10  65 181 137   0  45 100  71
    orange: '#cb4b16',//  9/3 brred    166 #d75f00 50  50  55 203  75  22  18  89  80
    red:    '#dc322f',//  1/1 red      160 #d70000 50  65  45 220  50  47   1  79  86
    magenta:'#d33682',//  5/5 magenta  125 #af005f 50  65 -05 211  54 130 331  74  83
    violet: '#6c71c4',// 13/5 brmagenta 61 #5f5faf 50  15 -45 108 113 196 237  45  77
    blue:   '#268bd2',//  4/4 blue      33 #0087ff 55 -10 -45  38 139 210 205  82  82
    cyan:   '#2aa198',//  6/6 cyan      37 #00afaf 60 -35 -05  42 161 152 175  74  63
    green:  '#859900',//  2/2 green     64 #5f8700 60 -20  65 133 153   0  68 100  60}
  };
  
  var width = 600;
  var height =400;
  var totalWordCounter;
  var completedWordCounter;
  var KeystrokerMistakeCounter;
  var GameOver=true;
  var GameOverTimeout=false;
  var numBases=8;
  
  var wpm =666;
  var bases=[];
  function resetBases(){
    bases = _.chain(_.range(numBases) )
      .map(function(item){
        return {
          x: (1+item)*width/(numBases+1),
          y: height*14/16,
          alive: true,
        };
      }).value();
    //add the bases
     _.each(bases,function(base,index){
      s.text(base.x,base.y,"\uf015")
        .attr({
          "id":"base"+index,
          "font-family": "FontAwesome",
          "font-size" : "40px",
          "dy" :".33em",
          "text-anchor": "middle",
          "fill":    colorPal.orange,
          "stroke": colorPal.base03,
        });
    });
  }
  
  var words=[];
  var activeWords=[];
  var currentEntry="";
  var targetedWord;
  var startTime,endTime;
 
  
  // acces <SVG id="mainSVG">
  var s = Snap("#mainSVG");
  s.attr({
    width: width,
    height:height,
    //style : "background-color:"+ colorPal.base03+";",
  });
  
  s.rect(0,0,width,height)
  .attr({
    fill:"l(0, 0, 1, 1)"+colorPal.base02+"-"+colorPal.base01,// #000-#f00-#fff",
  });  
  
  //basic background setup
  Snap.load("svg/backgroundSky.svg",function(bg){
    //add the background svg
    s.append(bg);
    //draw a curve
    s.path("M0,300 Q50,320 100,300  Q150,280 200,300 Q250,320 300,300  Q350,280 400,300  Q450,320 500,300  Q550,280 600,300 L600,400 L0,400")
      .attr({
        fill:colorPal.base2,
      });
    
    //add empty type history
    s.text(width/2,height*31/32,"")
      .attr({
          id:"typeHistory",
          fill: colorPal.base01,
          //stroke: colorPal.base03,
          "font-size": "23px",
          "text-anchor": "middle",
          //"stroke-width": 1,
        });
    //add the wpm counter <text> element
    s.text(width/64,height*63/64,"WPM: "+wpm)
      .attr({
          id:"wpmCounter",
          fill: colorPal.yellow,
          //stroke: colorPal.base03,
          "font-size": "21px",
          //"stroke-width": 1,
        });
    //reset and strart the word counter
     //load our text from file
    $.get( "txt/wordlist.txt", function( data ) {
      words=data.split(" ");
      //console.log(words);  
      //startNewGame();
      s.text(width/2,height*5/4,"Type words to defend the city. Press any key to start.")
        .attr({
          class:"gameOverText",
          fill:colorPal.red,
          "font-size": "20px",
          "text-anchor": "middle",
        })
        .animate({y:height*7/8}, 1000, mina.bounce);
    });
    
  });
 
  function startNewGame(){
    console.log("STARTING NEW GAME");
    var gameOverText;
    while(gameOverText=Snap.select('.gameOverText')){
      gameOverText.remove(); 
    }
    
    Snap.select("#typeHistory")
      .attr({
        text:"",
      })
    //reset the countes
    totalWordCounter=0;
    completedWordCounter=0;
    KeystrokerMistakeCounter=0;
    //init variables
    GameOver=false;
    activeWords=[];
    currentEntry="";
    targetedWord=undefined;
    startTime = new Date();
    //reset onscreen items and start th
    resetBases();
    
    resetWPM();
    startWordLoop();
  }
 
  function resetWPM(){
    wpm=25;
    startWPMcountUp();
  }
  
  function startWPMcountUp(){
    if(!GameOver){
      wpm+=5;
      Snap.select("#wpmCounter")
        .attr({
          text:"WPM: "+wpm
        });
      setTimeout(startWPMcountUp,15000);
    }
  }

  function startWordLoop(){
    //add words
    setTimeout( function(){
      //add a new word
      totalWordCounter++;
      var wordIndex=  Math.floor(words.length*Math.random() ); 
      var wordSlot = Math.floor(numBases*Math.random());
       
      var newWord= words[wordIndex];
      activeWords.push(newWord);
      if(!GameOver){
        var wordGroup= s.group()//create a group to contain the words
          .attr({
            id: newWord,
          })
          .text((1+wordSlot)*width/(numBases+1),height/16, newWord)
          .attr({
            id: "TEXT"+newWord,
            fill: colorPal.base1,
            //stroke: colorPal.base03,
            "font-size": "25px",
            "text-anchor": "middle",
            //"stroke-width": 1,
          })
          .animate({y:height*14/16}, 5000, mina.easeout,function(cb){

            var removeGroup =Snap.select("#"+newWord);
            if(removeGroup)
              addExplosion(this.attr('x'),this.attr('y'),1 );
            //console.log("!!!!!!!",removeGroup);
            //DESTROY BASES!!!!
            if(removeGroup){ //if it's null, it's because the word has arlready been typed and removed
              removeGroup.remove();
              activeWords=_.without(activeWords, newWord);
              if(!GameOver){
                var slotBase = Snap.select("#base"+wordSlot);
                  if(slotBase){
                    slotBase.remove();
                    //addExplosion(slotBase.attr('x'),slotBase.attr('y'),1 );
                    bases[wordSlot].alive=false; 
                  }
                //CHECK TO SEE IF GAME IS OVER
                var firstAliveBase=_.find(bases,function(base){
                  return  base.alive;
                });
                if(!firstAliveBase){
                  GameOver=true;
                  GameOverTimeout=true;
                  setTimeout(function(){GameOverTimeout=false;},5000);
                  endTime = new Date();
                  if (endTime < startTime) {
                      endTime.setDate(endTime.getDate() + 1);
                  }
                  var diff = endTime - startTime;
                  s.text(width/2,height*5/4,"GAME OVER")
                    .attr({
                      class:"gameOverText",
                      fill:colorPal.red,
                      "font-size": "60px",
                      "text-anchor": "middle",
                      stroke:colorPal.base03,
                      "stroke-width":1,
                    })
                    .animate({y:height*2/8}, 1000, mina.bounce);
                  s.text(width/2,height*6/4,"Destroyed "+completedWordCounter+' of '+totalWordCounter+' words in '+Math.floor(diff/1000)+' seconds!')
                    .attr({
                      class:"gameOverText",
                      fill:colorPal.cyan,
                      "font-size": "30px",
                      "text-anchor": "middle",
                    })
                    .animate({y:height*3/8}, 1000, mina.bounce);
                  s.text(width/2,height*7/4,"Actual words per minute: "+Math.floor(completedWordCounter*60*1000/diff) )
                    .attr({
                      class:"gameOverText",
                      fill:colorPal.cyan,
                      "font-size": "30px",
                      "text-anchor": "middle",
                    })
                    .animate({y:height*4/8}, 1000, mina.bounce);
                  s.text(width/2,height*8/4,"Total keystroke mistakes: "+KeystrokerMistakeCounter)
                    .attr({
                      class:"gameOverText",
                      fill:colorPal.cyan,
                      "font-size": "30px",
                      "text-anchor": "middle",
                    })
                    .animate({y:height*5/8}, 1000, mina.bounce);
                  setTimeout(function(){
                    s.text(width/2,height*5/4,"Press any key to play again.")
                    .attr({
                      class:"gameOverText",
                      fill:colorPal.red,
                      "font-size": "20px",
                      "text-anchor": "middle",
                    })
                    .animate({y:height*7/8}, 1000, mina.bounce);
                  },5000);
                }
              }
            }
          });
        startWordLoop();
      }
        
      //console.log(words[wordIndex]);
    },timeUntilNextWord());
  }
  function timeUntilNextWord(){
    return   (1000*60/wpm)*(1+0.5*(Math.random()-0.5));//0.75 to 1.25 times wpm in ms
  }
  
  $(document).bind("keyup",function(e){
    if(!GameOver){
      var  char = String.fromCharCode(e.which).toLowerCase();
      currentEntry+=char;
      var wordCompleted=false,
          wordStarted=false;
      //check to see if your currently entered string matches the start of a word or a whole word
      for(var i=0; i<activeWords.length && !wordCompleted &&!wordStarted  ; i++){
        var word = activeWords[i];
        if(word==currentEntry)
          wordCompleted=true;
        else if( currentEntry == word.substring(0,currentEntry.length) )
          wordStarted=true;
          
      }
      if(wordCompleted){
        //incriment
        completedWordCounter++;
        //add the full word to the bottom of the screen then ease it out of view before deleting it
        s.text(width/2,height*31/32,currentEntry)
        .attr({
            id:"typeHistory",
            fill: colorPal.base01,
            //stroke: colorPal.base03,
            "font-size": "23px",
            "text-anchor": "middle",
            //"stroke-width": 1,
          })
        .animate({y:(17/16)*height,"font-size":"1px"}, 500, mina.easeout,function(cb){
            this.remove();
          });
        //remove the completed word for the active word list
        activeWords=_.without(activeWords, currentEntry);
        //add an explosion to the scene
        var textEl = Snap.select("#TEXT"+currentEntry);
        addExplosion(textEl.attr('x'),textEl.attr('y') );
        //remove the word <text> element from the field of play
        Snap.select("#"+currentEntry).stop().remove();
      }
      //if you made a mistake or finished the word then reset the entered word to ''  
      if(!wordStarted){
        currentEntry='';
        KeystrokerMistakeCounter+=1;
      }
      //show your progress on the current word you are typing by update a <text> element at the bottom of the page
      Snap.select("#typeHistory")//"#"+activeWords[0])
        .attr({
          text: currentEntry,
        });
    }
    else{
      if(!GameOverTimeout)
        startNewGame();
    }
  });
  
  //define a random explosion path 
  var explosion;
  twoPi=2*3.14;
  explosion ="M"+25*Math.sin(0) +"," +25*Math.cos(0);
  for(var i=1; i<16;i++){
    var radius;
    if(i%2===0)
      radius=Math.random()*10+25;
    else
      radius=Math.random()*10+12;
    explosion += " L"+radius*Math.sin(twoPi*i/15) +"," +radius*Math.cos(twoPi*i/15);
  }
  explosion += " L"+25*Math.sin(0) +"," +25*Math.cos(0);
  
  //add an explosion at the indicated coordinates
  function addExplosion(x,y,colorScheme){
    colorScheme=colorScheme|0;
    var fillColor=colorPal.violet,
        strokeColor=colorPal.red;
    if(colorScheme===1){
      fillColor=colorPal.red;
      strokeColor=colorPal.violet;
    }
    s.path(explosion)
      .attr({
        fill:fillColor,
        transform:"translate("+x+","+y+") scale(0.25)", 
        stroke:strokeColor,
        "stroke-width":3,
      })
      .animate({transform:"translate("+x+","+y+") scale(1.0)"},125,mina.bounce,function(){
        this.animate({transform:"translate("+x+","+y+") scale(0.25)"},50,mina.linear,function(){
          this.remove();
        });
      });
  }
  
}();