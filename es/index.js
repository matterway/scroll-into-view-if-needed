import compute from 'compute-scroll-into-view'

function isOptionsObject(options) {
  return options === Object(options) && Object.keys(options).length !== 0
}

function defaultBehavior(actions, behavior, verticallyOnly) {
  var canSmoothScroll = 'scrollBehavior' in document.body.style
  actions.forEach(function(_ref) {
    var el = _ref.el,
      top = _ref.top,
      left = _ref.left

    if (el.scroll && canSmoothScroll) {
      el.scroll(
        verticallyOnly
          ? {
              top: top,
              behavior: behavior,
            }
          : {
              top: top,
              left: left,
              behavior: behavior,
            }
      )
    } else {
      el.scrollTop = top

      if (!verticallyOnly) {
        el.scrollLeft = left
      }
    }
  })
}

function getOptions(options) {
  if (options === false) {
    return {
      block: 'end',
      inline: 'nearest',
    }
  }

  if (isOptionsObject(options)) {
    return options
  }

  return {
    block: 'start',
    inline: 'nearest',
  }
}

function scrollIntoView(target, options) {
  var targetIsDetached = !target.ownerDocument.documentElement.contains(target)

  if (isOptionsObject(options) && typeof options.behavior === 'function') {
    return options.behavior(targetIsDetached ? [] : compute(target, options))
  }

  if (targetIsDetached) {
    return
  }

  var computeOptions = getOptions(options)
  return defaultBehavior(
    compute(target, computeOptions),
    computeOptions.behavior,
    computeOptions.verticallyOnly
  )
}

export default scrollIntoView
