;(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
    ? define(factory)
    : ((global = global || self), (global.scrollIntoView = factory()))
})(this, function() {
  'use strict'

  function isElement(el) {
    return el != null && typeof el === 'object' && el.nodeType === 1
  }

  function canOverflow(overflow, skipOverflowHiddenElements) {
    if (skipOverflowHiddenElements && overflow === 'hidden') {
      return false
    }

    return overflow !== 'visible' && overflow !== 'clip'
  }

  function isScrollable(el, skipOverflowHiddenElements) {
    if (el.clientHeight < el.scrollHeight || el.clientWidth < el.scrollWidth) {
      var style = getComputedStyle(el, null)
      return (
        canOverflow(style.overflowY, skipOverflowHiddenElements) ||
        canOverflow(style.overflowX, skipOverflowHiddenElements)
      )
    }

    return false
  }

  function alignNearest(
    scrollingEdgeStart,
    scrollingEdgeEnd,
    scrollingSize,
    scrollingBorderStart,
    scrollingBorderEnd,
    elementEdgeStart,
    elementEdgeEnd,
    elementSize
  ) {
    if (
      (elementEdgeStart < scrollingEdgeStart &&
        elementEdgeEnd > scrollingEdgeEnd) ||
      (elementEdgeStart > scrollingEdgeStart &&
        elementEdgeEnd < scrollingEdgeEnd)
    ) {
      return 0
    }

    if (
      (elementEdgeStart <= scrollingEdgeStart &&
        elementSize <= scrollingSize) ||
      (elementEdgeEnd >= scrollingEdgeEnd && elementSize >= scrollingSize)
    ) {
      return elementEdgeStart - scrollingEdgeStart - scrollingBorderStart
    }

    if (
      (elementEdgeEnd > scrollingEdgeEnd && elementSize < scrollingSize) ||
      (elementEdgeStart < scrollingEdgeStart && elementSize > scrollingSize)
    ) {
      return elementEdgeEnd - scrollingEdgeEnd + scrollingBorderEnd
    }

    return 0
  }

  var compute = function(target, options) {
    var scrollMode = options.scrollMode,
      block = options.block,
      inline = options.inline,
      boundary = options.boundary,
      skipOverflowHiddenElements = options.skipOverflowHiddenElements
    var checkBoundary =
      typeof boundary === 'function'
        ? boundary
        : function(node) {
            return node !== boundary
          }

    if (!isElement(target)) {
      throw new TypeError('Invalid target')
    }

    var scrollingElement = document.scrollingElement || document.documentElement
    var frames = []
    var cursor = target

    while (isElement(cursor) && checkBoundary(cursor)) {
      cursor = cursor.parentNode

      if (cursor === scrollingElement) {
        frames.push(cursor)
        break
      }

      if (
        cursor === document.body &&
        isScrollable(cursor) &&
        !isScrollable(document.documentElement)
      ) {
        continue
      }

      if (isScrollable(cursor, skipOverflowHiddenElements)) {
        frames.push(cursor)
      }
    }

    var viewportWidth = window.visualViewport
      ? visualViewport.width
      : innerWidth
    var viewportHeight = window.visualViewport
      ? visualViewport.height
      : innerHeight
    var viewportX = window.scrollX || pageXOffset
    var viewportY = window.scrollY || pageYOffset

    var _target$getBoundingCl = target.getBoundingClientRect(),
      targetHeight = _target$getBoundingCl.height,
      targetWidth = _target$getBoundingCl.width,
      targetTop = _target$getBoundingCl.top,
      targetRight = _target$getBoundingCl.right,
      targetBottom = _target$getBoundingCl.bottom,
      targetLeft = _target$getBoundingCl.left

    var targetBlock =
      block === 'start' || block === 'nearest'
        ? targetTop
        : block === 'end'
        ? targetBottom
        : targetTop + targetHeight / 2
    var targetInline =
      inline === 'center'
        ? targetLeft + targetWidth / 2
        : inline === 'end'
        ? targetRight
        : targetLeft
    var computations = []

    for (var index = 0; index < frames.length; index++) {
      var frame = frames[index]

      var _frame$getBoundingCli = frame.getBoundingClientRect(),
        _height = _frame$getBoundingCli.height,
        _width = _frame$getBoundingCli.width,
        _top = _frame$getBoundingCli.top,
        right = _frame$getBoundingCli.right,
        bottom = _frame$getBoundingCli.bottom,
        _left = _frame$getBoundingCli.left

      if (
        scrollMode === 'if-needed' &&
        targetTop >= 0 &&
        targetLeft >= 0 &&
        targetBottom <= viewportHeight &&
        targetRight <= viewportWidth &&
        targetTop >= _top &&
        targetBottom <= bottom &&
        targetLeft >= _left &&
        targetRight <= right
      ) {
        return computations
      }

      var frameStyle = getComputedStyle(frame)
      var borderLeft = parseInt(frameStyle.borderLeftWidth, 10)
      var borderTop = parseInt(frameStyle.borderTopWidth, 10)
      var borderRight = parseInt(frameStyle.borderRightWidth, 10)
      var borderBottom = parseInt(frameStyle.borderBottomWidth, 10)
      var blockScroll = 0
      var inlineScroll = 0
      var scrollbarWidth =
        'offsetWidth' in frame
          ? frame.offsetWidth - frame.clientWidth - borderLeft - borderRight
          : 0
      var scrollbarHeight =
        'offsetHeight' in frame
          ? frame.offsetHeight - frame.clientHeight - borderTop - borderBottom
          : 0

      if (scrollingElement === frame) {
        if (block === 'start') {
          blockScroll = targetBlock
        } else if (block === 'end') {
          blockScroll = targetBlock - viewportHeight
        } else if (block === 'nearest') {
          blockScroll = alignNearest(
            viewportY,
            viewportY + viewportHeight,
            viewportHeight,
            borderTop,
            borderBottom,
            viewportY + targetBlock,
            viewportY + targetBlock + targetHeight,
            targetHeight
          )
        } else {
          blockScroll = targetBlock - viewportHeight / 2
        }

        if (inline === 'start') {
          inlineScroll = targetInline
        } else if (inline === 'center') {
          inlineScroll = targetInline - viewportWidth / 2
        } else if (inline === 'end') {
          inlineScroll = targetInline - viewportWidth
        } else {
          inlineScroll = alignNearest(
            viewportX,
            viewportX + viewportWidth,
            viewportWidth,
            borderLeft,
            borderRight,
            viewportX + targetInline,
            viewportX + targetInline + targetWidth,
            targetWidth
          )
        }

        blockScroll = Math.max(0, blockScroll + viewportY)
        inlineScroll = Math.max(0, inlineScroll + viewportX)
      } else {
        if (block === 'start') {
          blockScroll = targetBlock - _top - borderTop
        } else if (block === 'end') {
          blockScroll = targetBlock - bottom + borderBottom + scrollbarHeight
        } else if (block === 'nearest') {
          blockScroll = alignNearest(
            _top,
            bottom,
            _height,
            borderTop,
            borderBottom + scrollbarHeight,
            targetBlock,
            targetBlock + targetHeight,
            targetHeight
          )
        } else {
          blockScroll = targetBlock - (_top + _height / 2) + scrollbarHeight / 2
        }

        if (inline === 'start') {
          inlineScroll = targetInline - _left - borderLeft
        } else if (inline === 'center') {
          inlineScroll =
            targetInline - (_left + _width / 2) + scrollbarWidth / 2
        } else if (inline === 'end') {
          inlineScroll = targetInline - right + borderRight + scrollbarWidth
        } else {
          inlineScroll = alignNearest(
            _left,
            right,
            _width,
            borderLeft,
            borderRight + scrollbarWidth,
            targetInline,
            targetInline + targetWidth,
            targetWidth
          )
        }

        var scrollLeft = frame.scrollLeft,
          scrollTop = frame.scrollTop
        blockScroll = Math.max(
          0,
          Math.min(
            scrollTop + blockScroll,
            frame.scrollHeight - _height + scrollbarHeight
          )
        )
        inlineScroll = Math.max(
          0,
          Math.min(
            scrollLeft + inlineScroll,
            frame.scrollWidth - _width + scrollbarWidth
          )
        )
        targetBlock += scrollTop - blockScroll
        targetInline += scrollLeft - inlineScroll
      }

      computations.push({
        el: frame,
        top: blockScroll,
        left: inlineScroll,
      })
    }

    return computations
  }

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
    var targetIsDetached = !target.ownerDocument.documentElement.contains(
      target
    )

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

  return scrollIntoView
})
