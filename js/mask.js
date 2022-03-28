class Mask {
  constructor(...fields) {
    this.mask = 0
    for (let i = 0; i < fields.length; i++) {
      this.mask |= fields[i]
    }
  }

  add(...fields) {
    for (let i = 0; i < fields.length; i++) {
      this.mask |= fields[i]
    }
    return this
  }

  contains(...fields) {
    for (let i = 0; i < fields.length; i++) {
      if ((this.mask &= fields[i]) !== fields[i]) return false
    }
    return true
  }

  remove(...fields) {
    for (let i = 0; i < fields.length; i++) {
      this.mask &= ~fields[i]
    }
    return this
  }

  valueOf() {
    return this.mask
  }

  toString() {
    return this.mask.toString(2)
  }
}