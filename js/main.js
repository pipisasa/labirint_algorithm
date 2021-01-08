const size = 500;

const cnv = document.createElement("canvas");

cnv.setAttribute("id", "myCanvas");
cnv.setAttribute("width", size);
cnv.setAttribute("height", size);
cnv.style.backgroundColor = '#ccc';

document.body.appendChild(cnv);

const ctx = cnv.getContext("2d")

const map = [
  [1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
];

class Hero {
  #y; #x;
  constructor(map = [], x, y, speed=1000) {
    this.map = map;
    this.#x = x;
    this.#y = y;
    this.cellWidth = size / map[0].length;
    this.cellHeight = size / map.length;
    this.onPoccess = false;
    this.speed = speed;
    this.setup();
    this.render();
  }

  setup(){
    this.ways = map.map(row => row.map(cell => {
      if (cell === 1) return '#';
      return '@';
    }));
    this.counter = 0;
    this.ways[this.y][this.x] = 'A';
  }

  get x() {
    return this.#x;
  }
  set x(val) {
    this.#x = val;
  }
  get y() {
    return this.#y;
  }
  set y(val) {
    this.#y = val;
  }

  getAdjacentCells(x, y) {
    const u = this.ways?.[y - 1]?.[x];
    const d = this.ways?.[y + 1]?.[x];
    const l = this.ways?.[y]?.[x - 1];
    const r = this.ways?.[y]?.[x + 1];
    return [
      { val: u, x: x, y: y - 1, },
      { val: d, x: x, y: y + 1, },
      { val: l, x: x - 1, y: y, },
      { val: r, x: x + 1, y: y, },
    ];
  }

  checkWays() {
    this.ways.find((row, y) => !!row.find((item, x) => {
      if (item === this.counter) {
        const cells = this.getAdjacentCells(x, y);
        return !!cells.find(cell => {// || +cell.val > this.counter+1
          if ((cell.val === '@' || cell.val === 'A') && this.ways?.[cell.y]?.[cell.x]) {
            cell.val = this.counter + 1;
            const val = this.ways[cell.y][cell.x];
            this.ways[cell.y][cell.x] = this.counter + 1;
            return val === "A";
          }
        })
      }
    }))
    this.counter++;
  }

  findWayTo(x, y) {
    if(!this.onPoccess){
      if (this.map[y][x] === 1) return;
      this.setup();
      this.onPoccess = true;
      this.ways[y][x] = 0;
    }
    this.checkWays();
    this.render();
    if (this.ways[this.y][this.x] !== "A") {
      // this.x = x;
      // this.y = y;
      // this.onPoccess = false;
      setTimeout(()=>this.goTo(x,y), this.speed);
    }else{
      setTimeout(()=>this.findWayTo(x,y), this.speed);
    }
  }

  goTo(x,y){
    if(this.x === x && this.y === y){
      this.onPoccess = false;
      return;
    }
    const self = this.ways[this.y][this.x];
    const cells = this.getAdjacentCells(this.x, this.y);
    const cell = cells.find(cell=>cell.val<self);
    this.x = cell.x;
    this.y = cell.y;
    this.render()
    setTimeout(()=>this.goTo(x,y), this.speed)
  }

  colors = {
    '#': "#000",
    '@': '#ccc',
  }

  render() {
    ctx.clearRect(0, 0, size, size);
    this.ways.forEach((row, y) => row.forEach((cell, x) => {
      ctx.fillStyle = typeof cell === "number" ? 'green' : this.colors[cell] || this.colors['@'];
      ctx.fillRect(x * this.cellWidth, y * this.cellHeight, this.cellWidth, this.cellHeight)
      if (typeof cell === "number") {
        ctx.fillStyle = "#000";
        ctx.font = "50px sans-serif";
        ctx.fillText(cell, x * this.cellWidth, (y + 1) * this.cellHeight, this.cellWidth);
      }
    }))
    ctx.beginPath()
    ctx.fillStyle = '#f3e721'
    ctx.arc(this.x*this.cellWidth + this.cellWidth/2, this.y*this.cellWidth + this.cellWidth/2, this.cellWidth/2 - 10, 0, 360);
    ctx.fill();
  }

}

const hero = new Hero(map, 1, 1);

cnv.onclick = (e) => {
  if (hero.onPoccess) return;
  const x = parseInt(e.offsetX / (size / map[0].length));
  const y = parseInt(e.offsetY / (size / map.length));
  // console.log(e.offsetX, e.offsetY);
  console.log(x, y);
  hero.findWayTo(x, y);
}

cnv.onmousemove = (e) => {
  if (hero.onPoccess) return;
  const x = parseInt(e.offsetX / (size / map[0].length));
  const y = parseInt(e.offsetY / (size / map.length));
  hero.render();
  ctx.lineWidth = 2
  ctx.strokeStyle = "#2196f3";
  ctx.strokeRect(x * hero.cellWidth, y * hero.cellHeight, hero.cellWidth, hero.cellWidth);
}