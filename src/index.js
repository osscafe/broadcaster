import riot from 'riot'
import route from 'riot-route'
import { view, mixin } from 'riot-action'

// actions
import Slide from './action/slide'

// tags
import 'riot-fa'
import './layout/slide.tag'

// registers riot-action as a middleware
riot.mixin(mixin)

// routings
view.mount('#container')
  .route('/', 'layout-slide', { action: Slide })
  .route('*', 'layout-slide', { action: Slide })

route.start(true)
