// Pointer (aka mouse) stuff
const hasRawPointer = 'onpointerrawupdate' in window

const p = {dx: 0, dy: 0}

const move = (e, cb, single = false) => {
    // !to fix ff https://github.com/w3c/pointerlock/issues/42
    if (single) {
        p.dx = e.movementX
        p.dy = e.movementY
        cb(p)
    } else {
        const _events = e.getCoalescedEvents?.()
        if (_events && (hasRawPointer || _events.length > 1)) {
            for (let i = 0; i < _events.length; i++) {
                p.dx = _events[i].movementX
                p.dy = _events[i].movementY
                cb(p)
            }
        }
    }
}

const idleHide = (el, time = 3000) => {
    let tm
    let move
    const cl = el.classList

    const hide = () => {
        cl.add('no-pointer')
        el.addEventListener('pointermove', move)
    }

    move = () => {
        cl.remove('no-pointer')
        clearTimeout(tm)
        tm = setTimeout(hide, time)
    }

    const show = () => {
        clearTimeout(tm)
        el.removeEventListener('pointermove', move)
        cl.remove('no-pointer')
    }

    return {
        hide,
        show,
    }
}

const track = (el, cb, single) => {
    const _move = (e) => {
        move(e, cb, single)
    }
    el.addEventListener(hasRawPointer ? 'pointerrawupdate' : 'pointermove', _move)
    return () => {
        el.removeEventListener(hasRawPointer ? 'pointerrawupdate' : 'pointermove', _move)
    }
}

const dpiScaler = () => {
    let ex = 0
    let ey = 0
    let scaled = {dx: 0, dy: 0}
    return {
        scale(x, y, src_w, src_h, dst_w, dst_h) {
            scaled.dx = x / (src_w / dst_w) + ex
            scaled.dy = y / (src_h / dst_h) + ey

            ex = scaled.dx % 1
            ey = scaled.dy % 1

            scaled.dx -= ex
            scaled.dy -= ey

            return scaled
        }
    }
}

export const pointer = {
    idleHide,
    track,
    scaler: dpiScaler
}
