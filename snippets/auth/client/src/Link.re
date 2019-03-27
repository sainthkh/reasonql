let component = ReasonReact.statelessComponent("Link");

let make = (
  ~href: string,
  ~className: string="",
  ~style: ReactDOMRe.style=ReactDOMRe.Style.make(),
  children
) => {
  ...component,

  render: _self => {
    let onClick = (href, event) => {
      ReasonReact.Router.push(href);
      event->ReactEvent.Synthetic.preventDefault;
    };

    <a href className style onClick={onClick(href)}>
      ...children
    </a>
  }
}
