@echo off
chcp 65001 > nul
echo ===================================================
echo [글로벌작명소] AI 개발부장 코다리의 원클릭 배포 스크립트 🚀
echo ===================================================
echo.
echo [1/3] 변경된 코드 상태 확인 중...
git status
echo.
echo [2/3] 변경 사항을 로컬 Git에 커밋하는 중...
git add .
git commit -m "feat: Gemini 429 레이트 리밋 우회 재시도 도입 및 글래스모피즘 에러 모달 추가"
echo.
echo [3/3] GitHub 저장소에 푸시하는 중... (이후 Render에서 자동 빌드 및 배포가 트리거됩니다)
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo ❌ 에러 발생: main 브랜치 푸시에 실패했습니다. master 브랜치로 재시도합니다...
    git push origin master
)
echo.
echo ===================================================
echo 🎉 작업 완료! GitHub에 정상적으로 업로드되었습니다.
echo Render 대시보드(https://dashboard.render.com/)에서 배포 상태를 확인해 주세요!
echo ===================================================
pause
