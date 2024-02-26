import { WS_MSGS } from '../utils/constants';

export interface Point {
    x: number;
    y: number;
}

export interface IncomingShip {
    position: Point;
    direction: boolean;
    type: 'huge' | 'large' | 'medium' | 'small';
    length: 4 | 3 | 2 | 1;
}

export interface Ship extends IncomingShip {
    availablePoints: Point[];
}

export interface ShipResponse {
    status: string;
    points: Point[];
}

export class Player {
    userId: number;
    ships: Ship[] = [];

    constructor(userId: number) {
        this.userId = userId;
    }

    processShips(point: Point) {
        let shipId = -1;
        let pointId = -1;

        let res: ShipResponse = { status: WS_MSGS.MISS, points: [] };

        for (let i = 0; i < this.ships.length; i++) {
            for (let j = 0; j < this.ships[i].availablePoints.length; j++) {
                if (
                    this.ships[i].availablePoints[j].x === point.x &&
                    this.ships[i].availablePoints[j].y === point.y
                ) {
                    shipId = i;
                    pointId = j;
                }
            }
        }

        if (shipId !== -1) {
            this.ships[shipId].availablePoints.splice(pointId, 1);

            if (this.ships[shipId].availablePoints.length === 0) {
                const isFinished = this.setIsFinished();

                if (isFinished) {
                    res.status = WS_MSGS.FINISH;
                } else {
                    res.status = WS_MSGS.KILLED;
                }

                if (!this.ships[shipId].direction) {
                    res.points.push({
                        x: this.ships[shipId].position.x - 1,
                        y: this.ships[shipId].position.y,
                    });
                    res.points.push({
                        x:
                            this.ships[shipId].position.x +
                            this.ships[shipId].length,
                        y: this.ships[shipId].position.y,
                    });

                    for (
                        let i = this.ships[shipId].position.x - 1;
                        i <=
                        this.ships[shipId].position.x +
                            this.ships[shipId].length;
                        i++
                    ) {
                        res.points.push({
                            x: i,
                            y: this.ships[shipId].position.y - 1,
                        });
                        res.points.push({
                            x: i,
                            y: this.ships[shipId].position.y + 1,
                        });
                    }
                } else {
                    res.points.push({
                        x: this.ships[shipId].position.x,
                        y: this.ships[shipId].position.y - 1,
                    });
                    res.points.push({
                        x: this.ships[shipId].position.x,
                        y:
                            this.ships[shipId].position.y +
                            this.ships[shipId].length,
                    });

                    for (
                        let i = this.ships[shipId].position.y - 1;
                        i <=
                        this.ships[shipId].position.y +
                            this.ships[shipId].length;
                        i++
                    ) {
                        res.points.push({
                            x: this.ships[shipId].position.x - 1,
                            y: i,
                        });
                        res.points.push({
                            x: this.ships[shipId].position.x + 1,
                            y: i,
                        });
                    }
                }
            } else {
                res = { status: WS_MSGS.SHOT, points: [] };
            }
        }

        return res;
    }

    setIsFinished() {
        let isFinished = true;

        for (let i = 0; i < this.ships.length; i++) {
            if (this.ships[i].availablePoints.length > 0) {
                isFinished = false;
            }
        }

        return isFinished;
    }

    setShips(incomingShips: IncomingShip[]) {
        incomingShips.forEach((incomingShip) => {
            this.ships.push({ ...incomingShip, availablePoints: [] });
        });

        this.setAvailableShipPoints();
    }

    setAvailableShipPoints() {
        this.ships.forEach((ship) => {
            if (ship.length === 4 && ship.direction) {
                ship.availablePoints.push({
                    x: ship.position.x,
                    y: ship.position.y,
                });
                ship.availablePoints.push({
                    x: ship.position.x,
                    y: ship.position.y + 1,
                });
                ship.availablePoints.push({
                    x: ship.position.x,
                    y: ship.position.y + 2,
                });
                ship.availablePoints.push({
                    x: ship.position.x,
                    y: ship.position.y + 3,
                });
            }
            if (ship.length === 4 && !ship.direction) {
                ship.availablePoints.push({
                    x: ship.position.x,
                    y: ship.position.y,
                });
                ship.availablePoints.push({
                    x: ship.position.x + 1,
                    y: ship.position.y,
                });
                ship.availablePoints.push({
                    x: ship.position.x + 2,
                    y: ship.position.y,
                });
                ship.availablePoints.push({
                    x: ship.position.x + 3,
                    y: ship.position.y,
                });
            }
            if (ship.length === 3 && ship.direction) {
                ship.availablePoints.push({
                    x: ship.position.x,
                    y: ship.position.y,
                });
                ship.availablePoints.push({
                    x: ship.position.x,
                    y: ship.position.y + 1,
                });
                ship.availablePoints.push({
                    x: ship.position.x,
                    y: ship.position.y + 2,
                });
            }
            if (ship.length === 3 && !ship.direction) {
                ship.availablePoints.push({
                    x: ship.position.x,
                    y: ship.position.y,
                });
                ship.availablePoints.push({
                    x: ship.position.x + 1,
                    y: ship.position.y,
                });
                ship.availablePoints.push({
                    x: ship.position.x + 2,
                    y: ship.position.y,
                });
            }
            if (ship.length === 2 && ship.direction) {
                ship.availablePoints.push({
                    x: ship.position.x,
                    y: ship.position.y,
                });
                ship.availablePoints.push({
                    x: ship.position.x,
                    y: ship.position.y + 1,
                });
            }
            if (ship.length === 2 && !ship.direction) {
                ship.availablePoints.push({
                    x: ship.position.x,
                    y: ship.position.y,
                });
                ship.availablePoints.push({
                    x: ship.position.x + 1,
                    y: ship.position.y,
                });
            }
            if (ship.length === 1) {
                ship.availablePoints.push({
                    x: ship.position.x,
                    y: ship.position.y,
                });
            }
        });
    }
}
