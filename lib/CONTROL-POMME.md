
CONTROL POMME
=============


Context
-------

I'm trying to extract some guidelines that could apply to Windows, Linux and Mac, altogether.
From https://github.com/jesus2099/konami-command/issues/735#issuecomment-1353186112

- Support keyboard-only interaction where possible [¹]
  I agree but specifically for POWER VOTE, it has to be a modifier key + click kind of shortcut
- Respect standard keyboard shortcuts [¹]
  Which prohibits Alt+click (Linux)
- Let people use modifier and other keys to adjust the behaviour of some interactions [¹]
- Prefer the **Command** key as the **main** modifier key in a custom keyboard shortcut [¹]
  This is called **Control** outside Mac
  Then let's call it _modifier key 1_ (**MK1**)
- Prefer the **Shift** key as a **secondary** modifier when the shortcut complements another shortcut [¹]
  Then let's call it _modifier key 2_ (**MK2**)
- Use the **Option** modifier sparingly [¹]
  This is called **Alt** outside Mac
  Then let's call it _modifier key 3_ (**MK3**)
- Don't use Ctrl+Alt combinations (MK1+MK3) [³]
- As much as possible, avoid using the **Control** key as a modifier [¹]
  I will also avoid using the **Windows** key, as it is not consistently supported by browsers
- List modifier keys in the correct order
  - Linux: Maybe each window system has its preference, if any
  - Mac: ~~Control,~~ Option, Shift, Command (^⌥⇧⌘) [¹]
  - Windows: ~~Windows,~~ Control, Alt, Shift [²]

| Modifier key  | Windows / Linux            | Mac                         |
|---------------|----------------------------|-----------------------------|
| MK1           | Control `ctrlKey`          | Command `metaKey` U+2318 ⌘ |
| MK2           | Shift `shiftKey`           | Shift `shiftKey` U+21E7 ⇧   |
| MK3           | Alt `altKey`               | Option `altKey` U+2325 ⌥   |
| Display order | MK1 MK3 MK2 key/click      | MK3 MK2 MK1 key/click       |
| Display style | Ctrl+Alt+Shift+Key [²] [³] | ⌥⇧⌘KEY [¹]                |

[¹]: https://developer.apple.com/design/human-interface-guidelines/inputs/keyboards
[²]: https://support.microsoft.com/windows/keyboard-shortcuts-in-windows-dcc61a57-8ff0-cffe-9796-cb9706c75eec
[³]: https://learn.microsoft.com/windows/win32/uxguide/inter-keyboard
