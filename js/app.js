import React from "react"

const CARDSET = ["3","3","4","4","5","5","6","6","7","7","8","8","9","9","10","10","J","J","Q","Q","K","K","A","A","2","2","小王","大王"];

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
            cardsDoms.push(<Card selectedCards={this.props.selectedCards} cardtype={CARDSET[Math.floor(card / this.props.cardsSetCnt)]} cardid={card} key={card} onCardClick={this.props.onCardClick} cardsSetCnt={this.props.cardsSetCnt}></Card>);
        }
        
        return <div className={className}>{cardsDoms}<div className="player-info">{this.props.playerInfo}</div></div>;
    }
}

class OptionNumberItem extends React.Component {
    constructor(props){
        super(props);
        this.state = {}
    }

    handleUpClick = ()=>{
        this.props.onModifyAmount(this.props.optionAmount + 1);
    }

    handleDownClick = ()=>{
        this.props.onModifyAmount(this.props.optionAmount - 1);
    }

    render() {
        return (<tr class="option-item">
        <td class="option-info">{this.props.optionName}：</td>
        <td align="center">{this.props.optionAmount}</td>
        <td align="right">
        <span className="btn-base" onClick={this.handleUpClick}><span>▲</span></span>
        <span className="btn-base" onClick={this.handleDownClick}><span>▼</span></span>
        </td>
        </tr>);
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
        this.optionsVisible = false;
        this.mouseDown = false;
        this.cardStart = -1;
        this.cardEnd = -1
        this.refreshTimeout = undefined;
        this.patt = /^([2-9JQKA]|10)[ ,\-]?([2-9JQKA]|10)[ ,\-]?([1-8])?$/i;
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

    changeCardsSetCnt = (cnt)=>{
        this.setState({cardsSetCnt: cnt});
    }

    handleCardMouseEvent = (cardid, eventId = 0)=>{
        switch(eventId){
            case 0:
                if(!this.state.selectedCards.has(cardid)){
                this.setState(()=>({selectedCards:this.state.selectedCards.add(cardid)}));
                }else{
                this.setState(()=>{
                    this.state.selectedCards.delete(cardid);
                return {selectedCards:this.state.selectedCards};
                });
                }
                break;
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

    toggleOptionsContainer = (visible) => {
        this.optionsVisible = visible;
        this.setState({});
    }

    clearSelected = ()=>{
        this.setState(()=>{
            this.state.selectedCards = new Set();
            return {selectedCards:this.state.selectedCards};
        });
    }

    handleCardsSetCntModify = (cnt)=>{
        cnt = cnt < 1 ? 1 : cnt > 4 ? 4 : cnt;
        if(cnt == this.state.cardsSetCnt){
            return
        }
        this.setState(()=>({
            cardsSetCnt: cnt
        }))
    }

    handleQuickPlay = (e)=>{
        clearTimeout(this.refreshTimeout);
        if(e.key == "Enter"){
            this.toNextPlayer();
            e.nativeEvent.srcElement.value = "";
            return;
        }
        this.refreshTimeout = setTimeout(()=>{
            let val = e.nativeEvent.srcElement.value;
            let res = val.match(this.patt);
            if(res != null){
                let [start, end, cnt] = [res[1].toUpperCase(), res[2].toUpperCase(), res[3]];
                if(cnt == undefined){
                    cnt = 1;
                }
                start = Math.floor(CARDSET.indexOf(start) / 2);
                end = Math.floor(CARDSET.indexOf(end) / 2);
                if(start > end){
                    [start, end] = [end, start];
                }
                let selected = new Set();
                let cur = 0;
                for(;start <= end; start ++){
                    cur = 0
                    for(let i = 0; i < this.state.cardsSetCnt * 2; i++){
                        if(this.state.remainCards.has(this.state.cardsSetCnt * 2 * start + i)){
                            selected.add(this.state.cardsSetCnt * 2 * start + i);
                            cur += 1;
                            if(cur == cnt)break;
                        }
                    }
                    if(cur < cnt){
                        //alert("剩余牌组不足以选取: " + CARDSET[start * 2]);
                        return;
                    }
                }
                this.setState(()=>{
                    return {selectedCards: selected};
                })
            }
        }, 200);
    }

    render(){
        let containerOptionsClassName="container-options";
        if(!this.optionsVisible){
            containerOptionsClassName += " invisible";
        }
        return (<div className="game-main">
        <div className="player-top"><Player cards={this.state.topCards} waitingPlayer={this.state.curPlayer % 4 == 0} key="top" playerInfo="玩家0" cardsSetCnt={this.state.cardsSetCnt}></Player></div>
        <div className="player-mid">
            <div className="player-left"><Player cards={this.state.leftCards} waitingPlayer={this.state.curPlayer % 4 == 3} key="left" playerInfo="玩家3" cardsSetCnt={this.state.cardsSetCnt}></Player></div>
            <div className="player-right"><Player cards={this.state.rightCards} waitingPlayer={this.state.curPlayer % 4 == 1} key="right" playerInfo="玩家1" cardsSetCnt={this.state.cardsSetCnt}></Player></div>
        </div>
        <div className="player-bottom"><Player cards={this.state.bottomCards} waitingPlayer={this.state.curPlayer % 4 == 2} key="bottom" playerInfo="玩家2" cardsSetCnt={this.state.cardsSetCnt}></Player></div>
        <br />
        <div className="player-counter"><Player cards={this.state.remainCards} key="remain" playerInfo="记牌" selectedCards={this.state.selectedCards} onCardClick={this.handleCardMouseEvent} cardsSetCnt={this.state.cardsSetCnt}></Player></div>
        <div className="panel-quick-play">
            <label for="quick-play">快速选牌: </label><input type="text" id="quick-play" name="quick-play" onKeyUp={(e)=>this.handleQuickPlay(e)} placeholder="开始牌型 结束牌型 [数量]"></input>
        </div>
        <br></br>
        <div className="container-btn-options">
        <span className="span-btn"><button className="btn" onClick={()=>this.toggleOptionsContainer(true)}>选项</button>
        <button className="btn" onClick={this.resetState}>重新开始</button>
        <button className="btn" onClick={this.recoverState}>撤销</button>
        <button className="btn" onClick={this.clearSelected}>取消选取</button></span>
        <div className="btn-play" onClick={this.toNextPlayer}>出牌</div>
        </div>
        <div className={containerOptionsClassName}>
            <div className="panel-options">
                <span className="btn-base to-top-right" onClick={()=>this.toggleOptionsContainer(false)}><p className="icon-close to-mid"></p></span>
                <table><tbody>
                <OptionNumberItem optionName="牌组数量" optionAmount={this.state.cardsSetCnt} onModifyAmount={this.handleCardsSetCntModify}></OptionNumberItem>
                </tbody></table>
            </div>
        </div>
        </div>);
    }
}