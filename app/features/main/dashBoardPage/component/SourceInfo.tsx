const SourceInfo = () => {
  return (
    <div className="text-sm text-gray-600">
      <p className="font-semibold">แหล่งที่มาของข้อมูล :</p>
      <p>
        ระบบเฝ้าระวังโรคดิจิทัล Digital Disease Surveillance (DDS) <br />
        <a
          className="text-blue-500 underline"
          href="https://ddcopendata.ddc.moph.go.th/opendata/file/663"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://ddcopendata.ddc.moph.go.th/opendata/file/663
        </a>
      </p>
    </div>
  );
};

export default SourceInfo;
