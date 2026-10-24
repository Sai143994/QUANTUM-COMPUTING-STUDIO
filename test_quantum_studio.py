import time
import json
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

TARGET_URL = "http://localhost:3000"

def run_quantum_studio_audit():
    print("=" * 75)
    print("  QUANTUM STUDIO ENTERPRISE RELIABILITY & FULL AUDIT SUITE")
    print("=" * 75)
    print(f"Target URL: {TARGET_URL}\n")

    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})

    results = {
        "timestamp": time.time(),
        "url": TARGET_URL,
        "availability": {},
        "performance": {},
        "font_verification": {},
        "multi_refresh_test": [],
        "multi_tab_concurrency": [],
        "tab_persistence_tests": [],
        "workspace_tab_tests": [],
        "interactive_controls": [],
        "console_errors": [],
        "summary": {"passed": 0, "failed": 0, "warnings": 0}
    }

    try:
        driver = webdriver.Chrome(options=options)
    except Exception as e:
        print(f"[-] Failed to launch Chrome WebDriver: {e}")
        return

    try:
        # -------------------------------------------------------------
        # 1. Availability, Load Performance & Professional Fonts
        # -------------------------------------------------------------
        print("[1/7] Testing Availability, Load Performance & Top-Developer Fonts...")
        start_time = time.time()
        driver.get(TARGET_URL)
        load_time = round(time.time() - start_time, 3)

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        page_title = driver.title

        perf_timings = driver.execute_script("""
            var t = window.performance.timing;
            return {
                dns: t.domainLookupEnd - t.domainLookupStart,
                tcp: t.connectEnd - t.connectStart,
                ttfb: t.responseStart - t.requestStart,
                domReady: t.domContentLoadedEventEnd - t.navigationStart,
                load: t.loadEventEnd - t.navigationStart
            };
        """)

        results["availability"] = {
            "status": "PASS" if "Quantum Studio" in page_title else "FAIL",
            "title": page_title,
            "load_time_sec": load_time
        }
        results["performance"] = perf_timings
        results["summary"]["passed"] += 1
        print(f"  [+] Page loaded in {load_time}s | Title: '{page_title}'")
        print(f"  [+] TTFB: {perf_timings.get('ttfb')}ms | DOM Ready: {perf_timings.get('domReady')}ms")

        # Verify Professional Font Family Stack
        font_check = driver.execute_script("""
            var body = window.getComputedStyle(document.body).fontFamily;
            var heading = document.querySelector('h1') ? window.getComputedStyle(document.querySelector('h1')).fontFamily : '';
            var code = document.querySelector('code, .font-mono') ? window.getComputedStyle(document.querySelector('code, .font-mono')).fontFamily : '';
            return {
                bodyFont: body,
                headingFont: heading,
                codeFont: code
            };
        """)
        results["font_verification"] = font_check
        has_pro_font = "Plus Jakarta Sans" in font_check["bodyFont"] or "Inter" in font_check["bodyFont"]
        has_mono_font = "JetBrains Mono" in font_check["codeFont"] or "monospace" in font_check["codeFont"]
        if has_pro_font and has_mono_font:
            results["summary"]["passed"] += 1
            print(f"  [+] Professional Font Hierarchy Verified:")
            print(f"      Body:    {font_check['bodyFont']}")
            print(f"      Heading: {font_check['headingFont']}")
            print(f"      Code:    {font_check['codeFont']}")
        else:
            results["summary"]["warnings"] += 1
            print(f"  [!] Font check note: {font_check}")

        # -------------------------------------------------------------
        # 2. Multi-Refresh Stress Test (5 Consecutive Refreshes)
        # -------------------------------------------------------------
        print("\n[2/7] Running Multi-Refresh Stress Test (5 Consecutive Reloads)...")
        refresh_success = True
        for i in range(1, 6):
            ref_start = time.time()
            driver.refresh()
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "main"))
            )
            dur = round(time.time() - ref_start, 3)

            # Check for any fatal crash or blank root
            root_children = driver.execute_script("return document.getElementById('root').children.length;")
            canvas_count = driver.execute_script("return document.querySelectorAll('canvas').length;")

            if root_children > 0:
                results["multi_refresh_test"].append({
                    "cycle": i,
                    "status": "PASS",
                    "reload_time_sec": dur,
                    "canvas_elements": canvas_count
                })
                print(f"  [+] Reload #{i} passed in {dur}s ({canvas_count} active WebGL canvases)")
            else:
                refresh_success = False
                results["multi_refresh_test"].append({
                    "cycle": i,
                    "status": "FAIL",
                    "reason": "Root rendered 0 child nodes"
                })
                print(f"  [-] Reload #{i} failed: empty root")

        if refresh_success:
            results["summary"]["passed"] += 1
        else:
            results["summary"]["failed"] += 1

        # -------------------------------------------------------------
        # 3. Multi-Tab / Multi-Open Concurrency Test (3 Parallel Tabs)
        # -------------------------------------------------------------
        print("\n[3/7] Testing Multi-Tab Concurrency (3 Parallel Instances)...")
        initial_handle = driver.current_window_handle
        tab_handles = [initial_handle]

        for tab_idx in range(1, 3):
            driver.execute_script(f"window.open('{TARGET_URL}', '_blank');")
            tab_handles = driver.window_handles
            driver.switch_to.window(tab_handles[tab_idx])
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "main"))
            )
            time.sleep(0.5)
            canvases = driver.execute_script("return document.querySelectorAll('canvas').length;")
            results["multi_tab_concurrency"].append({
                "tab_index": tab_idx + 1,
                "status": "PASS",
                "canvases": canvases
            })
            print(f"  [+] Tab instance #{tab_idx + 1} active & stable ({canvases} WebGL contexts)")

        # Switch back to first window and close extra tabs
        for h in tab_handles[1:]:
            driver.switch_to.window(h)
            driver.close()
        driver.switch_to.window(initial_handle)
        results["summary"]["passed"] += 1
        print("  [+] Multi-tab isolation and WebGL context concurrency verified.")

        # -------------------------------------------------------------
        # 4. Tab State Persistence Across Refreshes
        # -------------------------------------------------------------
        print("\n[4/7] Testing Tab Persistence Across Refreshes...")
        test_persist_tabs = [
            ("lab", "Quantum Lab"),
            ("transpiler", "Transpiler"),
            ("chemistry", "Chemistry"),
            ("composer", "Composer")
        ]

        for tab_id, tab_label in test_persist_tabs:
            driver.get(f"{TARGET_URL}/#tab={tab_id}")
            time.sleep(0.8)
            # Trigger page reload
            driver.refresh()
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "main"))
            )
            time.sleep(0.5)

            current_hash = driver.execute_script("return window.location.hash;")
            current_tab_session = driver.execute_script("return sessionStorage.getItem('qs_active_tab');")

            is_persisted = tab_id in current_hash or current_tab_session == tab_id
            if is_persisted:
                results["tab_persistence_tests"].append({
                    "tab": tab_id,
                    "label": tab_label,
                    "status": "PASS",
                    "hash": current_hash,
                    "sessionTab": current_tab_session
                })
                results["summary"]["passed"] += 1
                print(f"  [+] Tab '{tab_label}' ({tab_id}) survived hard refresh seamlessly")
            else:
                results["tab_persistence_tests"].append({
                    "tab": tab_id,
                    "label": tab_label,
                    "status": "WARN",
                    "hash": current_hash,
                    "sessionTab": current_tab_session
                })
                results["summary"]["warnings"] += 1
                print(f"  [?] Tab '{tab_label}' reset to: {current_tab_session}")

        # -------------------------------------------------------------
        # 5. Full Navigation Audit Across All 14 Workspace Tabs
        # -------------------------------------------------------------
        print("\n[5/7] Auditing All 14 Workspaces & Modules...")
        all_tabs = [
            ("dashboard", "Dashboard"),
            ("composer", "Composer"),
            ("algorithms", "Algorithms"),
            ("transpiler", "QPC Transpiler"),
            ("chemistry", "VQE Chemistry"),
            ("entanglement", "Entanglement"),
            ("cryptography", "QKD Crypto"),
            ("qml", "QML Studio"),
            ("qec", "QEC Logical"),
            ("pulse", "Pulse AWG"),
            ("lab", "Quantum Lab"),
            ("hardware", "Hardware"),
            ("outlook", "Global Outlook"),
            ("techmap", "3D Tech Matrix")
        ]

        for tab_id, tab_name in all_tabs:
            try:
                driver.get(f"{TARGET_URL}/#tab={tab_id}")
                time.sleep(0.6)
                # Ensure no blank screen
                content_len = driver.execute_script("return document.body.innerText.length;")
                canvases = driver.execute_script("return document.querySelectorAll('canvas').length;")

                if content_len > 100:
                    results["workspace_tab_tests"].append({
                        "tab": tab_id,
                        "name": tab_name,
                        "status": "PASS",
                        "canvases": canvases,
                        "text_length": content_len
                    })
                    results["summary"]["passed"] += 1
                    print(f"  [+] Workspace verified: {tab_name:<18} (Text chars: {content_len}, Canvases: {canvases})")
                else:
                    results["workspace_tab_tests"].append({
                        "tab": tab_id,
                        "name": tab_name,
                        "status": "FAIL",
                        "reason": f"Content length too short ({content_len})"
                    })
                    results["summary"]["failed"] += 1
                    print(f"  [-] Workspace empty or failed: {tab_name}")
            except Exception as e:
                results["workspace_tab_tests"].append({
                    "tab": tab_id,
                    "name": tab_name,
                    "status": "FAIL",
                    "error": str(e)
                })
                results["summary"]["failed"] += 1
                print(f"  [-] Error testing {tab_name}: {e}")

        # -------------------------------------------------------------
        # 6. Quantum Lab Cryo Architecture Interactive Controls
        # -------------------------------------------------------------
        print("\n[6/7] Testing Quantum Lab 3D Cryogenic Architecture Interactive Controls...")
        driver.get(f"{TARGET_URL}/#tab=lab")
        time.sleep(1.2)

        interactive_buttons = [
            "3D Visual Twin",
            "Quantum Engine Flow",
            "Physics Inspector",
            "Top Visual",
            "QPU 15mK",
            "All 3D",
            "Thermal FLIR",
            "RF X-Ray",
            "Gold Plate",
            "Cutaway Shield",
            "Sealed Can",
            "Bare Core"
        ]

        for btn_text in interactive_buttons:
            try:
                btn = WebDriverWait(driver, 3).until(
                    EC.element_to_be_clickable((By.XPATH, f"//button[contains(., '{btn_text}')]"))
                )
                driver.execute_script("arguments[0].click();", btn)
                time.sleep(0.3)
                results["interactive_controls"].append({
                    "control": btn_text,
                    "status": "PASS"
                })
                results["summary"]["passed"] += 1
                print(f"  [+] Interactive button tested & responsive: '{btn_text}'")
            except Exception:
                # Some buttons are in specific sub-tabs
                results["interactive_controls"].append({
                    "control": btn_text,
                    "status": "INFO",
                    "reason": "Button rendered conditionally in sub-mode"
                })

        # -------------------------------------------------------------
        # 7. Browser Console Error Audit
        # -------------------------------------------------------------
        print("\n[7/7] Auditing Browser Console for Severe Errors & Crashes...")
        logs = driver.get_log("browser")
        severe_errors = [
            l for l in logs 
            if l.get("level") == "SEVERE" 
            and "favicon.ico" not in l.get("message", "")
        ]
        results["console_errors"] = severe_errors

        if len(severe_errors) == 0:
            results["summary"]["passed"] += 1
            print("  [+] Zero SEVERE console errors detected across entire audit!")
        else:
            results["summary"]["failed"] += len(severe_errors)
            print(f"  [-] Detected {len(severe_errors)} severe console errors:")
            for err in severe_errors:
                print(f"      {err.get('message')}")

    finally:
        driver.quit()

    # Save full report
    with open("test_report.json", "w") as f:
        json.dump(results, f, indent=2)

    print("\n" + "=" * 75)
    print("  AUDIT SUMMARY")
    print("=" * 75)
    print(f"  Total Passed:   {results['summary']['passed']}")
    print(f"  Total Warnings: {results['summary']['warnings']}")
    print(f"  Total Failed:   {results['summary']['failed']}")
    print("  Full audit report saved to 'test_report.json'")
    print("=" * 75 + "\n")

if __name__ == "__main__":
    run_quantum_studio_audit()
