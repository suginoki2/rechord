import React, { Component } from "react"
import Field                from "../shared/Field"
import { validator }        from "../../validator"
import FormWithValidate     from "../../validator/FormWithValidate"

export default class TitleControl extends Component {
  constructor() {
    super()
    this.state = { touch: false }
  }
  validate = (value) => (
    validator({
      key:      "title",
      types:    [["required"], ["maxLength", 40]],
      setState: this.props.handleSetState,
      errors:   this.props.errors,
      value,
    })
  )
  handleTouch = () => {
    this.setState({ touch: true })
    this.validate(this.props.title)
  }
  handleSetTitle = (e) => {
    const { touch } = this.state
    const { handleSetState } = this.props
    handleSetState({ title: e.target.value })
    if (touch) this.validate(e.target.value)
  }
  render() {
    const { title, errors } = this.props
    return (
      <Field label="Title">
        <FormWithValidate errors={errors.title}>
          <input
            className="input"
            type="text"
            placeholder="title"
            value={title}
            onBlur={this.handleTouch}
            onChange={this.handleSetTitle}
          />
        </FormWithValidate>
      </Field>
    )
  }
}