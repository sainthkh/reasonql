type state = {
  text: string,
};

type action = 
  | Change(string)
  | Reset
  ;

let component = ReasonReact.reducerComponent("Form");

let make = (
  ~onSubmit,
  _children
) => {
  ...component,
  initialState: () => {
    text: "",
  },

  reducer: (action: action, _state: state) => {
    switch(action) {
    | Change(text) => ReasonReact.Update({ text: text })
    | Reset => ReasonReact.Update({ text: "" })
    }
  },

  render: self => {
    let onChange = event => {
      let v = ReactEvent.Form.target(event)##value;
      self.send(Change(v));
    };

    let onClick = _event => {
      self.send(Reset);
      onSubmit(self.state.text);
    };

    <div>
      <input type_="text" value=self.state.text onChange />
      <button onClick>{ ReasonReact.string("Tweet") }</button>
    </div>
  }
}