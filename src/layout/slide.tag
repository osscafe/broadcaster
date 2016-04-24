<layout-slide>

  <ul>
    <li each={ casts }>
      <fa icon="minus" onclick={ remove } />
      <fa if={ editing } icon="check" onclick={ edit } />
      <fa if={ !editing } icon="pencil" onclick={ edit } />
      <span if={ !editing } onclick={ select }>{ org }・{ name }</span>
      <span if={ editing } class="editing">
        <input value={ org } onchange={ changeOrg }>
        <input value={ name } onchange={ changeName }>
      </span>
    </li>
    <li><fa icon="plus" onclick={ add } /></li>
  </ul>

  <footer>
    <h1>{ selected.org }</h1>
    <h2>{ selected.name }</h2>
  </footer>

  <script>
    this.casts = []
    this.selected = {}
    this.add = e => {
      this.casts.push({ org: 'Something Cool', name: 'John Doe' })
      this.trigger('edit', this.casts)
    }
    this.select = e => { this.selected = e.item }
    this.remove = e => {
      this.casts = this.casts.filter(item => item != e.item)
      this.trigger('edit', this.casts)
    }
    this.edit = e => {
      e.item.editing = !e.item.editing
      this.trigger('edit', this.casts)
    }
    this.changeOrg = e => { e.item.org = e.target.value }
    this.changeName = e => { e.item.name = e.target.value }
  </script>

  <style scoped>
    :scope {
      position: absolute;
      height: 100%;
      width: 100%;
      font-family: 'Noto Sans Japanese', sans-serif;
      font-size: 3vh;
    }
    button {
      border: none;
      background: none;
    }
    ul {
      margin: 5vh 10vw;
      padding: 0;
      list-style: none;
    }
    li {
      margin: .3em 0;
    }
    li > * {
      line-height: 3em;
      display: block;
      padding: 0 1em;
      background: rgba(255,255,255,.4);
      color: rgba(0,0,0,.3);
    }
    li > fa {
      text-align: center;
      width: 1em;
      float: left;
    }
    li > fa + fa { float: right }
    li > span {
      margin: 0 3.3em;
    }
    li > span.editing {
      padding: 0;
      display: flex;
    }
    input {
      border: none;
      box-sizing: border-box;
      padding: 0 1em;
      flex-grow: 1;
    }
    input + input {
      border-left: 1px dashed rgba(0,0,0,.5)
    }
    footer {
      font-size: 3vh;
      height: 3em;
      padding: .8em 1.6em;
      background: white;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 5vh;
    }
    footer > h1 {
      font-size: 1em;
      font-weight: 300;
      margin: 0 0 .4em;
      padding: 0;
      line-height: 1em;
    }
    footer > h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 0;
      padding: 0;
      line-height: 1em;
    }
  </style>

</layout-slide>
