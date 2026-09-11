import AppKit
import XCTest
@testable import NightOwlClock25

final class WindowConfiguratorTests: XCTestCase {
    @MainActor
    func testSettingsBehaviorIsRepairedBeforeOrderingExistingWindow() {
        let window = SettingsOrderingWindow(contentRect: NSRect(x: 100, y: 100, width: 420, height: 360),
                                            styleMask: [.titled, .closable], backing: .buffered, defer: true)
        window.isReleasedWhenClosed = false
        defer { window.close() }
        let frame = window.frame
        let autosaveName = window.frameAutosaveName
        window.level = .floating

        for _ in 0..<2 {
            window.collectionBehavior = [.stationary, .transient, .canJoinAllSpaces, .fullScreenAuxiliary]
            SettingsWindowController.present(window)
            XCTAssertTrue(window.behaviorWhenOrdered.contains(.moveToActiveSpace))
            XCTAssertTrue(window.behaviorWhenOrdered.intersection([
                .stationary, .transient, .canJoinAllSpaces
            ]).isEmpty)
            XCTAssertTrue(window.behaviorWhenOrdered.contains(.fullScreenAuxiliary))
            XCTAssertEqual(window.frame, frame)
            XCTAssertEqual(window.frameAutosaveName, autosaveName)
            XCTAssertEqual(window.level, .floating)
        }
        XCTAssertEqual(window.orderCount, 2)
    }

    @MainActor
    func testSettingsReopensSameWindowWithActiveSpaceBehavior() {
        let controller = SettingsWindowController()
        let fonts = DigitalClockFontSettings()
        controller.show(fontSettings: fonts)
        guard let firstWindow = controller.window else {
            return XCTFail("Settings window was not created")
        }
        defer { firstWindow.close() }
        firstWindow.close()
        firstWindow.collectionBehavior = [.canJoinAllSpaces, .stationary, .transient]
        controller.show(fontSettings: fonts)
        XCTAssertTrue(controller.window === firstWindow)
        XCTAssertTrue(firstWindow.isVisible)
        XCTAssertTrue(firstWindow.collectionBehavior.contains(.moveToActiveSpace))
        XCTAssertTrue(firstWindow.collectionBehavior.intersection([
            .canJoinAllSpaces, .stationary, .transient
        ]).isEmpty)
    }

    @MainActor
    func testSettingsRemainIndependentAcrossAllCombinations() {
        let window = NSWindow(contentRect: NSRect(x: 100, y: 100, width: 520, height: 780),
                              styleMask: [.titled, .closable, .resizable],
                              backing: .buffered, defer: true)
        window.isReleasedWhenClosed = false
        defer { window.close() }

        // Start with the incompatible behaviors that must be cleaned up.
        window.collectionBehavior = [.transient, .stationary, .ignoresCycle, .moveToActiveSpace]
        window.hidesOnDeactivate = true
        for alwaysOnTop in [true, false] {
            for allSpaces in [true, false] {
                for fullScreen in [true, false] {
                    WindowConfigurator(alwaysOnTop: alwaysOnTop, showsOnAllSpaces: allSpaces,
                                       showsOverFullScreen: fullScreen).configure(window)
                    XCTAssertEqual(window.level, alwaysOnTop ? .floating : .normal)
                    XCTAssertFalse(window.hidesOnDeactivate)
                    XCTAssertTrue(window.collectionBehavior.contains(.managed))
                    XCTAssertEqual(window.collectionBehavior.contains(.canJoinAllSpaces), allSpaces)
                    XCTAssertEqual(window.collectionBehavior.contains(.fullScreenAuxiliary), fullScreen)
                    XCTAssertTrue(window.collectionBehavior.intersection([
                        .transient, .stationary, .ignoresCycle, .moveToActiveSpace
                    ]).isEmpty)
                }
            }
        }
    }

    @MainActor
    func testChangingSettingsPreservesWindowGeometryAndAutosaveKey() {
        // AppKit only allows one window per autosave name. Use the host app's
        // window when it already owns the production key.
        let hostWindow = NSApp.windows.first { $0.frameAutosaveName == "NightOwlClock25.MainWindow" }
        let window = hostWindow ?? NSWindow(contentRect: NSRect(x: 100, y: 100, width: 520, height: 780),
                              styleMask: [.titled, .closable, .resizable],
                              backing: .buffered, defer: true)
        let originalLevel = window.level
        let originalBehavior = window.collectionBehavior
        window.isReleasedWhenClosed = false
        defer {
            window.level = originalLevel
            window.collectionBehavior = originalBehavior
            if hostWindow == nil { window.close() }
        }
        WindowConfigurator(alwaysOnTop: false, showsOnAllSpaces: true,
                           showsOverFullScreen: false).configure(window)
        let frame = window.frame
        WindowConfigurator(alwaysOnTop: true, showsOnAllSpaces: false,
                           showsOverFullScreen: true).configure(window)
        XCTAssertEqual(window.frame, frame)
        XCTAssertEqual(window.frameAutosaveName, "NightOwlClock25.MainWindow")
        XCTAssertEqual(window.minSize, NSSize(width: 480, height: 720))
    }
}

@MainActor
private final class SettingsOrderingWindow: NSWindow {
    var behaviorWhenOrdered: NSWindow.CollectionBehavior = []
    var orderCount = 0

    override func makeKeyAndOrderFront(_ sender: Any?) {
        behaviorWhenOrdered = collectionBehavior
        orderCount += 1
    }
}
