const React = CMS.React;

class SimpleControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.value || "" };
  }

  handleChange = (e) => {
    const val = e.target.value;
    this.setState({ value: val });
    this.props.onChange(val);
  };

  render() {
    return React.createElement("input", {
      type: "text",
      value: this.state.value,
      onChange: this.handleChange,
      style: { width: "100%", padding: "8px" }
    });
  }
}

CMS.registerWidget("simple", SimpleControl);
