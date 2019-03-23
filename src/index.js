import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

function Square(props) {
  return (
    <button className={props.highlight? 'square-yellow': 'square'} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {   
  renderSquare(i) {
    return (
      <Square         
        value={this.props.squares[i]}
        highlight={this.props.highlight[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    let squaresTable = [];
    for (let i = 0; i < 3; i++) {
      let squaresRow = []
      for (let j = 0; j < 3; j++) {        
        squaresRow.push(this.renderSquare(i * 3 + j));
      }
      squaresTable.push(<div className="board-row">{squaresRow}</div>);
    }
    return <div>{squaresTable}</div>    
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        highlight: Array(9).fill(false),
        stepNumber: 0,
      }],
      stepNumber: 0,
      xIsNext: true,
      ascHistory: true,
    };
  }
  
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateGameResult(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        highlight: Array(9).fill(false),
        stepNumber: history.length,
        stepLocation: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    })
  }
  
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleHistoryOrder() {
    this.setState({
      ascHistory: !this.state.ascHistory,
    })
  }
  
  render() {
    const history = this.state.history.slice();
    const currentStepNumber = this.state.stepNumber
    const current = history[currentStepNumber];
    const gameResult = calculateGameResult(current.squares);
    
    let displayHistory = history;
    if (!this.state.ascHistory) {
      displayHistory = history.reverse();
    }
    const moves = displayHistory.map((step) => {
      const stepLocation = step.stepLocation;
      const desc = step.stepNumber ?
        'Go to move #' + step.stepNumber + " : (" + (stepLocation % 3) + "," + Math.floor(stepLocation / 3) + ")" :
        'Go to game start';
      return (
        <li key={step.stepNumber}>
          {step.stepNumber === currentStepNumber ? (
            <button onClick={() => this.jumpTo(step.stepNumber)}><b>{desc}</b></button>
          ) : (
            <button onClick={() => this.jumpTo(step.stepNumber)}>{desc}</button>
          )}
        </li>
      );
    });
    
    let status;
    if (gameResult) {
      if (gameResult.winner) {
        status = 'Winner: ' + gameResult.winner;
        gameResult.straight.forEach((index) => current.highlight[index] = true)
      } else {
        status = 'This game ended in a draw';
      }
    } else {
      status = 'Next player: ' + (this.state.xIsNext? 'X' : 'O');
    }
    
    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            highlight={current.highlight}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          Switch history order to <button onClick={() => this.toggleHistoryOrder()}>{this.state.ascHistory? 'Descending' : 'Ascending'}</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateGameResult(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        straight: lines[i],
      };
    }
  }
  if (squares.every((value) => value !== null)) {
    return {
      winner: null,
      straight: null,
    }
  }
  return null;
}
