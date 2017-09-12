// @flow

import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'
import React, { PureComponent } from 'react'
import {
  View,
  Text,
  PanResponder,
  InteractionManager,
  StyleSheet
} from 'react-native'
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 390
  },
  letter: {
    textAlign: 'center',
    fontSize: 14,
    width: 20,
    height: 15,
    fontFamily: 'AvenirNext-DemiBold',
    fontWeight: '600',
    color: 'rgb(110, 117, 155)'
  }
})

export class LetterPicker extends PureComponent {
  static propTypes = {
    letter: PropTypes.string.isRequired
  }

  _letterHeight = 15
  _calculateLetterHeight = () => this._letter.measure(this._setInitialHeights)
  _setInitialHeights = (x1, y1, width, height, offsetX, offsetY) => {
    this._letterHeight = height
  }

  render () {
    const { letter, style } = this.props
    return (
      <Text
        // ref={c => (this._letter = c)}
        // onLayout={this._calculateLetterHeight}
        style={[styles.letter, style]}
      >
        {letter}
      </Text>
    )
  }
}

export default class AlphabetPicker extends PureComponent {
  static propTypes = {
    alphabet: PropTypes.array,
    alphabetLength: PropTypes.number,
    onTouchStart: PropTypes.func,
    onTouchEnd: PropTypes.func,
    onTapLetter: PropTypes.func
  }

  static defaultProps = {
    alphabet: ALPHABET,
    alphabetLength: ALPHABET.length
  }

  _panResponder = {}
  _tapTimeout = null
  _container = null
  _containerHeight = 0
  _containerTopOffset = 0
  _letterTargets = {}

  componentWillMount () {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd
    })
  }

  _handleStartShouldSetPanResponder = (
    e: Object,
    gestureState: Object
  ): boolean => {
    return true
  }

  _handleMoveShouldSetPanResponder = (
    e: Object,
    gestureState: Object
  ): boolean => {
    return true
  }

  _handlePanResponderGrant = (e: Object, gestureState: Object) => {
    const { onTouchStart } = this.props
    onTouchStart && onTouchStart()
    this._tapTimeout = setTimeout(() => {
      this._onTapLetter(this._findTouchedLetter(gestureState.y0))
    }, 100)
  }

  _handlePanResponderMove = (e: Object, gestureState: Object) => {
    clearTimeout(this._tapTimeout)
    this._onTapLetter(this._findTouchedLetter(gestureState.moveY))
  }

  _handlePanResponderEnd = (e: Object, gestureState: Object) => {
    const { onTouchEnd } = this.props
    InteractionManager.runAfterInteractions(() => {
      onTouchEnd && onTouchEnd()
    })
  }

  _onInitialLayout = () => this._container.measure(this._setInitialHeights)
  _setInitialHeights = (x1, y1, width, height, offsetX, offsetY) => {
    this._containerTopOffset = offsetY
    this._containerHeight = height
  }

  _onTapLetter (letter) {
    letter && this.props.onTapLetter && this.props.onTapLetter(letter)
  }

  _findTouchedLetter = y => {
    const { alphabet, alphabetLength } = this.props
    let top = y - (this._containerTopOffset || 0)

    if (top >= 1 && top <= this._containerHeight) {
      const index = Math.floor(top / this._containerHeight * alphabetLength)
      this._letterTargets[index] = alphabet[index]
      return alphabet[index]
    }
  }

  _renderLetter = letter => {
    const { letterStyle } = this.props
    return <LetterPicker letter={letter} key={letter} style={letterStyle} />
  }

  render () {
    const { alphabet, alphabetLength, style } = this.props
    return (
      <View
        style={[
          styles.container,
          style,
          {
            height: 15 * alphabetLength
          }
        ]}
        onLayout={this._onInitialLayout}
        ref={c => (this._container = c)}
        {...this._panResponder.panHandlers}
      >
        {alphabet.map(this._renderLetter)}
      </View>
    )
  }
}
