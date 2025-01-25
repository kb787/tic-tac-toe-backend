class TicTacToe {
    constructor() {
      this.board = Array(9).fill(null);
      this.currentPlayer = 'X';
    }
  
    makeMove(position) {
      if (this.board[position] !== null) {
        throw new Error('Invalid move');
      }
      
      this.board[position] = this.currentPlayer;
      const winner = this.checkWinner();
      
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      
      return {
        board: this.board,
        winner: winner,
        nextPlayer: this.currentPlayer
      };
    }
  
    checkWinner() {
      const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], 
        [0, 3, 6], [1, 4, 7], [2, 5, 8], 
        [0, 4, 8], [2, 4, 6] 
      ];
  
      for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (
          this.board[a] &&
          this.board[a] === this.board[b] &&
          this.board[a] === this.board[c]
        ) {
          return this.board[a];
        }
      }
  
      return this.board.every(cell => cell !== null) ? 'Draw' : null;
    }
  }
  
  module.exports = TicTacToe;