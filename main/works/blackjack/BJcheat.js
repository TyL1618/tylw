//--------------------------------------------------------CheatMode
function gamestartcheat()    //新一盤
{
	var stri='開啟新局';
	print(stri);
	cheatgameover();
	//init
	chipsval=0;
	dealercount=0;
	playercount=0;
	dealercardtotal=0;  //莊家牌總和
	playercardtotal=0;  //閒家牌總和
	playerspade=0;  //閒家是否有A
	dealerspade=0;  //莊家是否有A
	document.getElementById("pool").textContent=' 當前獎池: '+pool1+'元 | 當前賭注: '+chipsval+'元'; //修改獎池
	document.getElementById("DealerTotalPoints").textContent=0; //修改莊家點數
	document.getElementById("PlayerTotalPoints").textContent=0; //修改莊家點數
	document.getElementById("chipsvalue").value='';
	document.getElementById("dealertable1").src = "./Image/black.png";
	document.getElementById("dealertable2").src = "./Image/black.png";
	document.getElementById("dealertable3").src = "./Image/black.png";
	document.getElementById("dealertable4").src = "./Image/black.png";
	document.getElementById("dealertable5").src = "./Image/black.png";
	document.getElementById("player1table1").src = "./Image/black.png";
	document.getElementById("player1table2").src = "./Image/black.png";
	document.getElementById("player1table3").src = "./Image/black.png";
	document.getElementById("player1table4").src = "./Image/black.png";
	document.getElementById("player1table5").src = "./Image/black.png";
	//重置按鈕
	document.getElementById("startButton").disabled = true;
	document.getElementById("hitButton").disabled = true;
	document.getElementById("standButton").disabled = true;
	document.getElementById("surrenderButton").disabled = true;
	document.getElementById("doubleButton").disabled = true;
	document.getElementById("ChipsButton").disabled = false;
	document.getElementById("chipsvalue").disabled = false;
	//先下注
	chipcheat();
}
function cheatdoublechips()
{
	var stri='玩家加倍下注';
	print(stri);
	pool1-=chipsval;
	chipsval*=2;
	document.getElementById("pool").textContent=' 當前獎池: '+pool1+'元 | 當前賭注: '+chipsval+'元'; //修改獎池
	var strii='當前獎池: '+pool1+'元 | 當前賭注: '+chipsval+'元';
	print(strii);
	cheathit();
	if(playercardtotal>21)
	{
		return;
	}
	cheatstand();
	document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
	document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改閒家點數
	//重置按鈕
	document.getElementById("startButton").disabled = false;
	document.getElementById("hitButton").disabled = true;
	document.getElementById("standButton").disabled = true;
	document.getElementById("surrenderButton").disabled = true;
	document.getElementById("doubleButton").disabled = true;
	document.getElementById("ChipsButton").disabled = true;
	document.getElementById("chipsvalue").disabled = true;
	return;
}
function chipcheat()
{
	//取得賭注金額
	chipsval=document.getElementById("chipsvalue").value;
	if(chipsval=="" || chipsval<=0 || isNaN(chipsval)==1 || chipsval>500)
	{
		return;
	}
	chipsval=Number(chipsval);
	pool1-=chipsval;
	var stri='閒家下注，金額為 : '+chipsval;
	var strii;
	print(stri);
	document.getElementById("chipsvalue").value='';
	document.getElementById("pool").textContent=' 當前獎池: '+pool1+'元 | 當前賭注: '+chipsval+'元'; //修改獎池
	document.getElementById("startButton").disabled = true;
	document.getElementById("hitButton").disabled = false;
	document.getElementById("standButton").disabled = false;
	document.getElementById("surrenderButton").disabled = false;
	document.getElementById("doubleButton").disabled = false;
	document.getElementById("ChipsButton").disabled = true;
	document.getElementById("chipsvalue").disabled = true;
	//開局發牌
	var randomNum1 = 36;
	var randomNum2 = 42;
	var randomNum3 = 45;
	var randomNum4 = Math.floor(Math.random() * 52);
	//修改莊家總點數
	document.getElementById("dealertable1").src = imagesArray[randomNum1];
	document.getElementById("dealertable2").src = "./Image/back1.png";
	var dealercard1=0;
	var dealercard2=0;
	if(randomNum1<=35)
	{
		dealercard1=((randomNum1/4)+2);
		dealercard1=parseInt(dealercard1);
	}
	else if(randomNum1>=40 && randomNum1<=51)
	{
		dealercard1=10;
	}
	else
	{
		dealercard1=11;
		dealerspade+=1;
	}
	dealercard1=Number(dealercard1);
	dealercardtotal+=dealercard1;
	dealercardtotal=Number(dealercardtotal);
	document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
	//修改閒家總點數
	document.getElementById("player1table1").src = imagesArray[randomNum2];
	document.getElementById("player1table2").src = imagesArray[randomNum3];
	var playercard1=0;  //閒家第一張
	if(randomNum2<=35)
	{
		playercard1=((randomNum2/4)+2);
		playercard1=parseInt(playercard1);
	}
	else if(randomNum2>=40 && randomNum2<=51)
	{
		playercard1=10;
	}
	else
	{
		playercard1=11;
		playerspade+=1;
	}
	playercard1=Number(playercard1);
	playercardtotal+=playercard1;
	playercardtotal=Number(playercardtotal);
	var playercard2=0;  //閒家第二張
	if(randomNum3<=35)
	{
		playercard2=((randomNum3/4)+2);
		playercard2=parseInt(playercard2);
	}
	else if(randomNum3>=40 && randomNum3<=51)
	{
		playercard2=10;
	}
	else
	{
		playercard2=11;
		playerspade+=1;
	}
	playercard2=Number(playercard2);
	playercardtotal+=playercard2;
	playercardtotal=Number(playercardtotal);
	if(playercardtotal>21 && playerspade==2)  //如果開頭兩張A=11+1
	{
		playercardtotal-=10;
		playerspade-=1;
	}
	document.getElementById("PlayerTotalPoints").textContent=playercardtotal; //修改閒家點數
	playercount+=1;
	
	if(playercardtotal==21) //閒家開局Black Jack
	{
		document.getElementById("dealertable2").src = imagesArray[randomNum4];
		if(randomNum4<=35)
		{
			dealercard2=((randomNum4/4)+2);
			dealercard2=parseInt(dealercard2);
		}
		else if(randomNum4>=40 && randomNum4<=51)
		{
			dealercard2=10;
		}
		else
		{
			if(dealercard1==10)
			{
				dealercard2=11;
			}
			else
			{
				dealercard2=1;
			}
		}
		dealercard2=Number(dealercard2);
		dealercardtotal+=dealercard2;
		dealercardtotal=Number(dealercardtotal);
		document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
		
		if(dealercardtotal==playercardtotal)  //雙方黑傑克
		{
			pool1+=chipsval;
			document.getElementById("pool").textContent='平局'+' 當前獎池:'+pool1+'元'; //修改獎池
		}
		else  //閒家黑傑克贏
		{
			pool1+=chipsval+chipsval*1.5;
			var chtemp=Number(chipsval*1.5);
			document.getElementById("pool").textContent='閒家21點:賠率x1.5 '+'獲得'+chtemp+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
		}
		//重新設定
		document.getElementById("startButton").disabled = false;
		document.getElementById("hitButton").disabled = true;
		document.getElementById("standButton").disabled = true;
		document.getElementById("surrenderButton").disabled = true;
		document.getElementById("doubleButton").disabled = true;
		document.getElementById("ChipsButton").disabled = true;
		document.getElementById("chipsvalue").disabled = true;
	}
}
function cheathit() //抽牌
{
	var stri='玩家開牌';
	var strii;
	print(stri);
	var Num1 = 32;
	var Num2 = 33;
	var Num3 = 34;
	var playercard3=0;
	var playercard4=0;
	var playercard5=0;
	if(playercount==1)
	{
		document.getElementById("player1table3").src = imagesArray[Num1];
		playercount+=1;
		if(Num1<=35)
		{
			playercard3=((Num1/4)+2);
			playercard3=parseInt(playercard3);
		}
		else if(Num1>=40 && Num1<=51)
		{
			playercard3=10;
		}
		else
		{
			playercard3=11;
			playerspade+=1;
		}
		playercardtotal+=playercard3;
		document.getElementById("PlayerTotalPoints").textContent=playercardtotal; //修改閒家點數
		if(playercardtotal>21)
		{
			if(playerspade!=0)
			{
				playercardtotal-=10;
				playerspade-=1;
				document.getElementById("PlayerTotalPoints").textContent=playercardtotal; //修改閒家點數
			}
			else
			{
				document.getElementById("pool").textContent='閒家超過21點 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				strii='閒家超過21點 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元';
				print(strii);
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
		}
		else if(playercardtotal==21)
		{
			cheatstand();
			//document.getElementById("pool").textContent='閒家21點: '+'獲得'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
			
			//重新設定
			document.getElementById("startButton").disabled = false;
			document.getElementById("hitButton").disabled = true;
			document.getElementById("standButton").disabled = true;
			document.getElementById("surrenderButton").disabled = true;
			document.getElementById("doubleButton").disabled = true;
			document.getElementById("ChipsButton").disabled = true;
			document.getElementById("chipsvalue").disabled = true;
			return;
		}
	}
	else if(playercount==2)
	{
		document.getElementById("player1table4").src = imagesArray[Num2];
		playercount+=1;
		if(Num2<=35)
		{
			playercard4=((Num2/4)+2);
			playercard4=parseInt(playercard4);
		}
		else if(Num2>=40 && Num2<=51)
		{
			playercard4=10;
		}
		else
		{
			playercard4=11;
			playerspade+=1;
		}
		playercardtotal+=playercard4;
		document.getElementById("PlayerTotalPoints").textContent=playercardtotal; //修改閒家點數
		if(playercardtotal>21)
		{
			if(playerspade!=0)
			{
				playercardtotal-=10;
				playerspade-=1;
				document.getElementById("PlayerTotalPoints").textContent=playercardtotal; //修改閒家點數
			}
			else
			{
				document.getElementById("pool").textContent='閒家超過21點 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
		}
		else if(playercardtotal==21)
		{
			cheatstand();
			/*
			pool1+=chipsval*2;
			*/
			//document.getElementById("pool").textContent='閒家21點: '+'獲得'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
			
			//重新設定
			document.getElementById("startButton").disabled = false;
			document.getElementById("hitButton").disabled = true;
			document.getElementById("standButton").disabled = true;
			document.getElementById("surrenderButton").disabled = true;
			document.getElementById("doubleButton").disabled = true;
			document.getElementById("ChipsButton").disabled = true;
			document.getElementById("chipsvalue").disabled = true;
			return;
		}
	}
	else if(playercount==3)
	{
		document.getElementById("player1table5").src = imagesArray[Num3];
		playercount+=1;
		if(Num3<=35)
		{
			playercard5=((Num3/4)+2);
			playercard5=parseInt(playercard5);
		}
		else if(Num3>=40 && Num3<=51)
		{
			playercard5=10;
		}
		else
		{
			playercard5=11;
			playerspade+=1;
		}
		playercardtotal+=playercard5;
		document.getElementById("PlayerTotalPoints").textContent=playercardtotal; //修改閒家點數
		if(playercardtotal>21)
		{
			if(playerspade!=0)
			{
				playercardtotal-=10;
				playerspade-=1;
				document.getElementById("PlayerTotalPoints").textContent=playercardtotal; //修改閒家點數
			}
			else
			{
				document.getElementById("pool").textContent='閒家超過21點 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
		}
		else if(playercardtotal<=21)
		{
			cheatstand();
			//document.getElementById("pool").textContent='閒家'+playercardtotal+'點: '+'獲得'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
			
			//重新設定
			document.getElementById("startButton").disabled = false;
			document.getElementById("hitButton").disabled = true;
			document.getElementById("standButton").disabled = true;
			document.getElementById("surrenderButton").disabled = true;
			document.getElementById("doubleButton").disabled = true;
			document.getElementById("ChipsButton").disabled = true;
			document.getElementById("chipsvalue").disabled = true;
			return;
		}
	}
}
function cheatstand() 
{
	var stri='莊家開牌';
	var strii;
	print(stri);
	//選項關閉
	document.getElementById("startButton").disabled = false;
	document.getElementById("hitButton").disabled = true;
	document.getElementById("standButton").disabled = true;
	document.getElementById("surrenderButton").disabled = true;
	document.getElementById("doubleButton").disabled = true;
	document.getElementById("ChipsButton").disabled = true;
	document.getElementById("chipsvalue").disabled = true;
	var dearand1 = 51;
	var dearand2 = Math.floor(Math.random() * 52);
	var dearand3 = Math.floor(Math.random() * 52);
	var dearand4 = Math.floor(Math.random() * 52);
	var dealercard2=0;
	var dealercard3=0;
	var dealercard4=0;
	var dealercard5=0;
	//發牌
	if(dealercount==0)
	{
		document.getElementById("dealertable2").src = imagesArray[dearand1];
		if(dearand1<=35)
		{
			dealercard2=((dearand1/4)+2);
			dealercard2=parseInt(dealercard2);
		}
		else if(dearand1>=40 && dearand1<=51)
		{
			dealercard2=10;
		}
		else
		{
			dealercard2=11;
			dealerspade+=1;
		}
		dealercardtotal+=dealercard2;
		document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
		if(dealercardtotal>21)  //莊家爆牌
		{
			pool1+=chipsval*2;
			document.getElementById("pool").textContent='莊家爆牌 '+'獲得'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
			document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
			//重新設定
			document.getElementById("startButton").disabled = false;
			document.getElementById("hitButton").disabled = true;
			document.getElementById("standButton").disabled = true;
			document.getElementById("surrenderButton").disabled = true;
			document.getElementById("doubleButton").disabled = true;
			document.getElementById("ChipsButton").disabled = true;
			document.getElementById("chipsvalue").disabled = true;
			return;
		}
		else if(dealercardtotal==21)  //莊家黑傑克
		{
			if(dealercardtotal==playercardtotal)  //平局
			{
				pool1+=chipsval;
				document.getElementById("pool").textContent='21點平局 '+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
			else  //莊家黑傑克勝
			{
				document.getElementById("pool").textContent='莊家21點 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				strii='莊家21點 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元';
				print(strii);
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
		}
		else if(dealercardtotal>=17 && dealercardtotal<21)  //莊家達到門檻
		{
			if(dealercardtotal>playercardtotal)  //莊家勝
			{
				document.getElementById("pool").textContent='莊家勝 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
			else if(dealercardtotal<playercardtotal)  //閒家勝
			{
				pool1+=chipsval*2;
				document.getElementById("pool").textContent='閒家勝 '+'獲得'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
			else  //平局
			{
				pool1+=chipsval;
				document.getElementById("pool").textContent='21點平局 '+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
		}
		dealercount+=1;
	}
	if(dealercount==1)
	{
		document.getElementById("dealertable3").src = imagesArray[dearand2];
		if(dearand2<=35)
		{
			dealercard3=((dearand2/4)+2);
			dealercard3=parseInt(dealercard3);
		}
		else if(dearand2>=40 && dearand2<=51)
		{
			dealercard3=10;
		}
		else
		{
			dealercard3=11;
			dealerspade+=1;
		}
		dealercardtotal+=dealercard3;
		document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
		if(dealercardtotal>21)  //莊家爆牌
		{
			if(dealerspade!=0)
			{
				dealercardtotal-=10;
				dealerspade-=1;
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				if(dealercardtotal>=17 && dealercardtotal<21)  //莊家達到門檻
				{
					if(dealercardtotal>playercardtotal)  //莊家勝
					{
						document.getElementById("pool").textContent='莊家勝 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
						document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
						//重新設定
						document.getElementById("startButton").disabled = false;
						document.getElementById("hitButton").disabled = true;
						document.getElementById("standButton").disabled = true;
						document.getElementById("surrenderButton").disabled = true;
						document.getElementById("doubleButton").disabled = true;
						document.getElementById("ChipsButton").disabled = true;
						document.getElementById("chipsvalue").disabled = true;
						return;
					}
					else if(dealercardtotal<playercardtotal)  //閒家勝
					{
						pool1+=chipsval*2;
						document.getElementById("pool").textContent='閒家勝 '+'獲得'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
						document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
						//重新設定
						document.getElementById("startButton").disabled = false;
						document.getElementById("hitButton").disabled = true;
						document.getElementById("standButton").disabled = true;
						document.getElementById("surrenderButton").disabled = true;
						document.getElementById("doubleButton").disabled = true;
						document.getElementById("ChipsButton").disabled = true;
						document.getElementById("chipsvalue").disabled = true;
						return;
					}
					else  //平局
					{
						pool1+=chipsval;
						document.getElementById("pool").textContent='21點平局 '+' 當前獎池:'+pool1+'元'; //修改獎池
						document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
						//重新設定
						document.getElementById("startButton").disabled = false;
						document.getElementById("hitButton").disabled = true;
						document.getElementById("standButton").disabled = true;
						document.getElementById("surrenderButton").disabled = true;
						document.getElementById("doubleButton").disabled = true;
						document.getElementById("ChipsButton").disabled = true;
						document.getElementById("chipsvalue").disabled = true;
						return;
					}
				}
			}
			else
			{
				pool1+=chipsval*2;
				document.getElementById("pool").textContent='莊家爆牌 '+'獲得'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
		}
		else if(dealercardtotal==21)  //莊家黑傑克
		{
			if(dealercardtotal==playercardtotal)  //平局
			{
				pool1+=chipsval;
				document.getElementById("pool").textContent='21點平局 '+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
			else  //莊家黑傑克勝
			{
				document.getElementById("pool").textContent='莊家21點 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
		}
		else if(dealercardtotal>=17 && dealercardtotal<21)  //莊家達到門檻
		{
			if(dealercardtotal>playercardtotal)  //莊家勝
			{
				document.getElementById("pool").textContent='莊家勝 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
			else if(dealercardtotal<playercardtotal)  //閒家勝
			{
				pool1+=chipsval*2;
				document.getElementById("pool").textContent='閒家勝 '+'獲得'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
			else  //平局
			{
				pool1+=chipsval;
				document.getElementById("pool").textContent='21點平局 '+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
		}
		dealercount+=1;
	}
	if(dealercount==2)
	{
		document.getElementById("dealertable4").src = imagesArray[dearand3];
		if(dearand3<=35)
		{
			dealercard4=((dearand3/4)+2);
			dealercard4=parseInt(dealercard4);
		}
		else if(dearand3>=40 && dearand3<=51)
		{
			dealercard4=10;
		}
		else
		{
			dealercard4=11;
			dealerspade+=1;
		}
		dealercardtotal+=dealercard4;
		document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
		if(dealercardtotal>21)  //莊家爆牌
		{
			if(dealerspade!=0)
			{
				dealercardtotal-=10;
				dealerspade-=1;
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				if(dealercardtotal>=17 && dealercardtotal<21)  //莊家達到門檻
				{
					if(dealercardtotal>playercardtotal)  //莊家勝
					{
						document.getElementById("pool").textContent='莊家勝 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
						//重新設定
						document.getElementById("startButton").disabled = false;
						document.getElementById("hitButton").disabled = true;
						document.getElementById("standButton").disabled = true;
						document.getElementById("surrenderButton").disabled = true;
						document.getElementById("doubleButton").disabled = true;
						document.getElementById("ChipsButton").disabled = true;
						document.getElementById("chipsvalue").disabled = true;
						return;
					}
					else if(dealercardtotal<playercardtotal)  //閒家勝
					{
						pool1+=chipsval*2;
						document.getElementById("pool").textContent='閒家勝 '+'獲得'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
						//重新設定
						document.getElementById("startButton").disabled = false;
						document.getElementById("hitButton").disabled = true;
						document.getElementById("standButton").disabled = true;
						document.getElementById("surrenderButton").disabled = true;
						document.getElementById("doubleButton").disabled = true;
						document.getElementById("ChipsButton").disabled = true;
						document.getElementById("chipsvalue").disabled = true;
						return;
					}
					else  //平局
					{
						pool1+=chipsval;
						document.getElementById("pool").textContent='21點平局 '+' 當前獎池:'+pool1+'元'; //修改獎池
						document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
						//重新設定
						document.getElementById("startButton").disabled = false;
						document.getElementById("hitButton").disabled = true;
						document.getElementById("standButton").disabled = true;
						document.getElementById("surrenderButton").disabled = true;
						document.getElementById("doubleButton").disabled = true;
						document.getElementById("ChipsButton").disabled = true;
						document.getElementById("chipsvalue").disabled = true;
						return;
					}
				}
			}
			else
			{
				pool1+=chipsval*2;
				document.getElementById("pool").textContent='莊家爆牌 '+'獲得'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
		}
		else if(dealercardtotal==21)  //莊家黑傑克
		{
			if(dealercardtotal==playercardtotal)  //平局
			{
				pool1+=chipsval;
				document.getElementById("pool").textContent='21點平局 '+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
			else  //莊家黑傑克勝
			{
				document.getElementById("pool").textContent='莊家21點 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
		}
		else if(dealercardtotal>=17 && dealercardtotal<21)  //莊家達到門檻
		{
			if(dealercardtotal>playercardtotal)  //莊家勝
			{
				document.getElementById("pool").textContent='莊家勝 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
			else if(dealercardtotal<playercardtotal)  //閒家勝
			{
				pool1+=chipsval*2;
				document.getElementById("pool").textContent='閒家勝 '+'獲得'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
			else  //平局
			{
				pool1+=chipsval;
				document.getElementById("pool").textContent='21點平局 '+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
		}
		dealercount+=1;
	}
	if(dealercount==3)
	{
		document.getElementById("dealertable5").src = imagesArray[dearand4];
		if(dearand4<=35)
		{
			dealercard5=((dearand4/4)+2);
			dealercard5=parseInt(dealercard5);
		}
		else if(dearand4>=40 && dearand4<=51)
		{
			dealercard5=10;
		}
		else
		{
			dealercard5=11;
			dealerspade+=1;
		}
		dealercardtotal+=dealercard5;
		document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
		if(dealercardtotal>21)  //莊家爆牌
		{
			if(dealerspade!=0)
			{
				dealercardtotal-=10;
				dealerspade-=1;
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				if(dealercardtotal>=17 && dealercardtotal<21)  //莊家達到門檻
				{
					if(dealercardtotal>playercardtotal)  //莊家勝
					{
						document.getElementById("pool").textContent='莊家勝 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
						//重新設定
						document.getElementById("startButton").disabled = false;
						document.getElementById("hitButton").disabled = true;
						document.getElementById("standButton").disabled = true;
						document.getElementById("surrenderButton").disabled = true;
						document.getElementById("doubleButton").disabled = true;
						document.getElementById("ChipsButton").disabled = true;
						document.getElementById("chipsvalue").disabled = true;
						return;
					}
					else if(dealercardtotal<playercardtotal)  //閒家勝
					{
						pool1+=chipsval*2;
						document.getElementById("pool").textContent='閒家勝 '+'獲得'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
						//重新設定
						document.getElementById("startButton").disabled = false;
						document.getElementById("hitButton").disabled = true;
						document.getElementById("standButton").disabled = true;
						document.getElementById("surrenderButton").disabled = true;
						document.getElementById("doubleButton").disabled = true;
						document.getElementById("ChipsButton").disabled = true;
						document.getElementById("chipsvalue").disabled = true;
						return;
					}
					else  //平局
					{
						pool1+=chipsval;
						document.getElementById("pool").textContent='21點平局 '+' 當前獎池:'+pool1+'元'; //修改獎池
						//重新設定
						document.getElementById("startButton").disabled = false;
						document.getElementById("hitButton").disabled = true;
						document.getElementById("standButton").disabled = true;
						document.getElementById("surrenderButton").disabled = true;
						document.getElementById("doubleButton").disabled = true;
						document.getElementById("ChipsButton").disabled = true;
						document.getElementById("chipsvalue").disabled = true;
						return;
					}
				}
			}
			else
			{
				pool1+=chipsval*2;
				document.getElementById("pool").textContent='莊家爆牌 '+'獲得'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
		}
		else if(dealercardtotal==21)  //莊家黑傑克
		{
			if(dealercardtotal==playercardtotal)  //平局
			{
				pool1+=chipsval;
				document.getElementById("pool").textContent='21點平局 '+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
			else  //莊家黑傑克勝
			{
				document.getElementById("pool").textContent='莊家21點 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
		}
		else if(dealercardtotal>=17 && dealercardtotal<21)  //莊家達到門檻
		{
			if(dealercardtotal>playercardtotal)  //莊家勝
			{
				document.getElementById("pool").textContent='莊家勝 '+'損失'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
			else if(dealercardtotal<playercardtotal)  //閒家勝
			{
				pool1+=chipsval*2;
				document.getElementById("pool").textContent='閒家勝 '+'獲得'+chipsval+'元'+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
			else  //平局
			{
				pool1+=chipsval;
				document.getElementById("pool").textContent='21點平局 '+' 當前獎池:'+pool1+'元'; //修改獎池
				document.getElementById("DealerTotalPoints").textContent=dealercardtotal; //修改莊家點數
				//重新設定
				document.getElementById("startButton").disabled = false;
				document.getElementById("hitButton").disabled = true;
				document.getElementById("standButton").disabled = true;
				document.getElementById("surrenderButton").disabled = true;
				document.getElementById("doubleButton").disabled = true;
				document.getElementById("ChipsButton").disabled = true;
				document.getElementById("chipsvalue").disabled = true;
				return;
			}
		}
		dealercount+=1;
	}
}
function cheatgameover()
{	
	if(pool1<=0)
	{
		pool1=0;
		if (confirm("已無籌碼，重新遊玩") == true) 
		{
			location.reload();
		}
		else 
		{
		}
	}

}