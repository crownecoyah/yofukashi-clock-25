import ServiceManagement
import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var fontSettings: DigitalClockFontSettings
    @State private var showsFontPicker = false
    @AppStorage("boundaryHour") private var boundaryHour = 5
    @AppStorage("showsSeconds") private var showsSeconds = false
    @AppStorage("alwaysOnTop") private var alwaysOnTop = false
    @AppStorage("showsOnAllSpaces") private var showsOnAllSpaces = true
    @AppStorage("showsOverFullScreen") private var showsOverFullScreen = false
    @State private var launchesAtLogin = SMAppService.mainApp.status == .enabled
    @State private var loginError: String?

    var body: some View {
        Form {
            Picker("一日の境界", selection: $boundaryHour) {
                ForEach(0...12, id: \.self) { hour in
                    Text("\(hour)時まで今日！").tag(hour)
                }
            }
            .help("この時刻より前を、前日の24時以降として表示します。")

            Toggle("秒を表示", isOn: $showsSeconds)
            LabeledContent("デジタル時計のフォント") {
                Button("変更…") { showsFontPicker = true }
            }
            Toggle("常に最前面", isOn: $alwaysOnTop)
            Toggle("すべてのデスクトップに表示", isOn: $showsOnAllSpaces)
            Toggle("フルスクリーンアプリ上にも表示", isOn: $showsOverFullScreen)
            Toggle("ログイン時に起動", isOn: $launchesAtLogin)
                .onChange(of: launchesAtLogin) { _, enabled in updateLoginItem(enabled) }

            if let loginError {
                Text(loginError)
                    .font(.caption)
                    .foregroundStyle(.red)
            }
        }
        .formStyle(.grouped)
        .padding()
        .frame(width: 420)
        .navigationTitle("設定")
        .sheet(isPresented: $showsFontPicker) {
            DigitalClockFontPicker()
        }
    }

    private func updateLoginItem(_ enabled: Bool) {
        do {
            if enabled { try SMAppService.mainApp.register() }
            else { try SMAppService.mainApp.unregister() }
            loginError = nil
        } catch {
            launchesAtLogin = SMAppService.mainApp.status == .enabled
            loginError = "ログイン時の起動を変更できませんでした: \(error.localizedDescription)"
        }
    }
}
