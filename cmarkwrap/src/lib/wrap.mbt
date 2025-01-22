///|
pub fn render(md : String) -> Result[String, Error] {
  @cmark_html.render?(md)
}

///|
pub fn result_unwrap(res : Result[String, Error]) -> String {
  match res {
    Ok(s) => s
    Err(_) => ""
  }
}

///|
pub fn result_is_ok(res : Result[String, Error]) -> Bool {
  res.is_ok()
}
