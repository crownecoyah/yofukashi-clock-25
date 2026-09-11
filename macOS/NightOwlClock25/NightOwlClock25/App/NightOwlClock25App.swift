import SwiftUI

@main
struct NightOwlClock25App: App {
    @StateObject private var fontSettings = DigitalClockFontSettings()
    var body: some Scene {
        WindowGroup("夜ふかし時計25時") {
            ContentView()
                .environmentObject(fontSettings)
                .onReceive(NotificationCenter.default.publisher(for: NSApplication.didBecomeActiveNotification)) { _ in
                    fontSettings.refreshAvailableFonts()
                }
        }
        .defaultSize(width: 520, height: 780)
        .windowResizability(.contentMinSize)

        .commands {
            CommandGroup(replacing: .appSettings) {
                Button("設定…") {
                    SettingsWindowController.shared.show(fontSettings: fontSettings)
                }
                .keyboardShortcut(",", modifiers: .command)
            }
        }
    }
}
