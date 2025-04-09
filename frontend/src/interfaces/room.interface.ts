export class Room {
    private _id: string;
    private _adversary?: string;
    private _players: Array<{name: string, crowns: number}> = [];
    private _finished: boolean = false;

    userPoints: number = 0;
    adversaryPoints: number = 0;
  
    constructor(id: string) {
      this._id = id;
    }
  
    get id(): string {
      return this._id;
    }

    set adversary(adversary: string) {
        this._adversary = adversary;
    }

    get adversary(): string | undefined {
      return this._adversary;
    }

    get players(): Array<{name: string, crowns: number}> {
        return this._players;
    }

    set players(players: Array<{name: string, crowns: number}>) {
        this._players = players;
    }

    get finished(): boolean {
        return this._finished;
    }

    set finished(value: boolean) {
        this._finished = value;
    }
    
    addPointToUser(countPoints: number): void {
        this.userPoints += countPoints;
    }

    addPointsToAdversary(countPoints: number): void {
      this.adversaryPoints += countPoints;
    }

    resetPoints(): void {
        this.userPoints = 0;
        this.adversaryPoints = 0;
    }
}