import React from "react"

const CARDSET = ["3","3","4","4","5","5","6","6","7","7","8","8","9","9","10","10","J","J","Q","Q","K","K","A","A","2","2","小王","大王"];
var cardSetCnt = 2;

class Card extends React.Component{
    constructor(props){
        super(props)
    }

    onCardClick = ()=>{
        this.props.onCardClick && this.props.onCardClick(this.props.cardid);
    }
    
    render(){
        let className = "card";
        if(this.props.selectedCards && this.props.selectedCards.has(this.props.cardid)){
            className += " card-selected";
        }
        return <div className={className} onClick={this.onCardClick}>{this.props.cardtype}</div>

    }
}

class Player extends React.Component{
    constructor(props){
        super(props)
        this.state = {}
    }

    render(){
        let className = "player";
        if(this.props.waitingPlayer){
            className += " player-waiting";
        }
        if(this.props.cards.length == 0){
            return <div className={className}>暂无出牌<div className="player-info">{this.props.playerInfo}</div></div>;
        }
        let cardsDoms = []
        for(let card of this.props.cards){
            cardsDoms.push(<Card selectedCards={this.props.selectedCards} cardtype={CARDSET[Math.floor(card / cardSetCnt)]} cardid={card} key={card} onCardClick={this.props.onCardClick}></Card>);
        }
        
        return <div className={className}>{cardsDoms}<div className="player-info">{this.props.playerInfo}</div></div>;
    }
}

export default class CardGame extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            cardsSetCnt: 2
        }
        this.state = this.getInitState();
        this.usedStates = [];
    }

    getInitState = ()=>{
        var remain = new Set();
        let cnt = this.state.cardsSetCnt
        let cur = 0
        for(let i = 0;i < cnt; i++){
            for(let j of CARDSET.keys()){
                remain.add(cur);
                cur++;
            }
        }
        return {
            cardsSetCnt: cnt,
            curPlayer: 0,
            remainCards: remain,
            leftCards:[],
            topCards:[],
            rightCards:[],
            bottomCards:[],
            selectedCards:new Set()
        };
    };

    resetState = ()=>{
        if(this.usedStates.length > 0){
            this.usedStates = [this.usedStates[this.usedStates.length - 1]];
        }
        this.setState(this.getInitState());
    }

    recoverState = ()=>{
        if(this.usedStates.length > 0){
            this.setState(this.usedStates.pop());
        }else{
            alert("不能再撤销了");
        }
    }

    changeCardSetCnt=(cnt)=>{
        this.setState({cardsSetCnt: cnt});
        cardSetCnt = cnt;
    }

    handleCardClick = (cardid)=>{
        if(!this.state.selectedCards.has(cardid)){
           this.setState(()=>({selectedCards:this.state.selectedCards.add(cardid)}));
        }else{
            this.setState(()=>{
                this.state.selectedCards.delete(cardid);
                return {selectedCards:this.state.selectedCards};
            });
        }
    }

    skipPlayer = ()=>{
        this.state.selectedCards = new Set();
        this.toNextPlayer();
    }

    toNextPlayer = ()=>{
        let copyState = {}
        for(let key in this.state){
            if(typeof(this.state[key]) == "number"){
                copyState[key] = this.state[key];
            }else if(Array.isArray(this.state[key])){
                copyState[key] = [...this.state[key],];
            }else if(this.state[key] instanceof Set){
                copyState[key] = new Set([...this.state[key]]);
            }
        }
        this.usedStates.push(copyState);

        var curCards = this.state.topCards
        switch(this.state.curPlayer){
            case(1):
                curCards = this.state.rightCards
                break;
            case(2):
                curCards = this.state.bottomCards
                break;
            case(3):
                curCards = this.state.leftCards
                break;
        }

        for(let cardid of this.state.selectedCards){
            curCards.push(cardid);
            this.state.remainCards.delete(cardid);
        }
        curCards.sort((a,b)=>(a-b));

        this.setState(()=>{
            return {
                curPlayer: (this.state.curPlayer + 1) % 4,
                selectedCards:new Set()
            }
        });
    }

    clearSelected = ()=>{
        this.setState(()=>{
            this.state.selectedCards = new Set();
            return {selectedCards:this.state.selectedCards};
        });
    }

    render(){
        return (<div className="game-main">
        <div className="player-top"><Player cards={this.state.topCards} waitingPlayer={this.state.curPlayer % 4 == 0} key="top" playerInfo="玩家0"></Player></div>
        <div className="player-mid">
            <div className="player-left"><Player cards={this.state.leftCards} waitingPlayer={this.state.curPlayer % 4 == 3} key="left" playerInfo="玩家3"></Player></div>
            <div className="player-right"><Player cards={this.state.rightCards} waitingPlayer={this.state.curPlayer % 4 == 1} key="right" playerInfo="玩家1"></Player></div>
        </div>
        <div className="player-bottom"><Player cards={this.state.bottomCards} waitingPlayer={this.state.curPlayer % 4 == 2} key="bottom" playerInfo="玩家2"></Player></div>
        <br />
        <div className="player-counter"><Player cards={this.state.remainCards} key="remain" playerInfo="记牌" selectedCards={this.state.selectedCards} onCardClick={this.handleCardClick}></Player></div>
        <div className="container-options">
        <button className="btn" onClick={this.resetState}>重新开始</button>
        <button className="btn" onClick={this.recoverState}>撤销</button>
        <button className="btn" onClick={this.skipPlayer}>跳过</button>
        <button className="btn" onClick={this.clearSelected}>取消选取</button>
        <button className="btn btn-play" onClick={this.toNextPlayer}>出牌</button>
        </div>
        </div>);
    }
}