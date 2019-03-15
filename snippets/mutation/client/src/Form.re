let component = ReasonReact.statelessComponent("Form")

let make = (_children) => {
  ...component,

  render: _self => {
    <div>
      <input />
      <button>{ ReasonReact.string("Tweet") }</button>
    </div>
  }
}
