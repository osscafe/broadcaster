import Action from 'riot-action'
import route from 'riot-route'

export default class $ extends Action {
  /** ルーティングが処理されたとき */
  route () {
    var casts = JSON.parse(localStorage.getItem('broadcaster-casts') || '[]')
    this.update({ casts, selected: casts[0] })
  }

  edit (casts) {
    localStorage.setItem('broadcaster-casts', JSON.stringify(casts))
  }
}
