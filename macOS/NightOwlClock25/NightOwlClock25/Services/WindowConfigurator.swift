import AppKit
import SwiftUI

@MainActor
final class SettingsWindowController {
    static let shared = SettingsWindowController()
    private(set) var window: NSWindow?

    func show(fontSettings: DigitalClockFontSettings) {
        if window == nil {
            let window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 420, height: 360),
                                  styleMask: [.titled, .closable], backing: .buffered, defer: false)
            window.title = "設定"
            window.isReleasedWhenClosed = false
            window.contentView = NSHostingView(rootView: SettingsView().environmentObject(fontSettings))
            window.center()
            self.window = window
        }
        guard let window else { return }
        Self.present(window)
    }

    static func present(_ window: NSWindow) {
        // Reapply before ordering even when this is a previously closed window.
        // AppKit moves the window to the active Space when it is ordered front.
        var behavior = window.collectionBehavior
        behavior.subtract([.stationary, .transient, .canJoinAllSpaces])
        behavior.insert(.moveToActiveSpace)
        window.collectionBehavior = behavior
        window.makeKeyAndOrderFront(nil)
    }
}

struct WindowConfigurator: NSViewRepresentable {
    let alwaysOnTop: Bool
    let showsOnAllSpaces: Bool
    let showsOverFullScreen: Bool

    func makeNSView(context: Context) -> NSView {
        let view = NSView()
        DispatchQueue.main.async { configure(view.window) }
        return view
    }

    func updateNSView(_ view: NSView, context: Context) {
        DispatchQueue.main.async { configure(view.window) }
    }

    func configure(_ window: NSWindow?) {
        guard let window else { return }
        // Keep the existing autosave key; setting changes must not reload the frame.
        if window.frameAutosaveName != "NightOwlClock25.MainWindow" {
            window.setFrameAutosaveName("NightOwlClock25.MainWindow")
        }
        window.minSize = NSSize(width: 480, height: 720)
        window.hidesOnDeactivate = false
        window.level = alwaysOnTop ? .floating : .normal

        // Floating windows also need explicit Mission Control management.
        var behavior = window.collectionBehavior
        behavior.subtract([.transient, .stationary, .ignoresCycle, .moveToActiveSpace,
                           .canJoinAllSpaces, .fullScreenAuxiliary])
        behavior.insert(.managed)
        if showsOnAllSpaces { behavior.insert(.canJoinAllSpaces) }
        if showsOverFullScreen { behavior.insert(.fullScreenAuxiliary) }
        window.collectionBehavior = behavior
    }
}
